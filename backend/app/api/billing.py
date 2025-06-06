from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.api.deps import get_current_user
from app.schemas.user import User
from app.core.config import settings
from app.core.database import get_db
import stripe
from typing import Optional

router = APIRouter()

if settings.STRIPE_ENABLED and settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


@router.get("/subscription")
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's subscription status"""
    if not settings.STRIPE_ENABLED:
        return {"status": "disabled"}
    
    try:
        # Get user's stripe customer id
        profile = await db.table("profiles").select("stripe_customer_id").eq("id", current_user.id).single().execute()
        
        if not profile.data or not profile.data.get("stripe_customer_id"):
            return {"status": "free"}
        
        # Get active subscriptions
        subscriptions = stripe.Subscription.list(
            customer=profile.data["stripe_customer_id"],
            status="active",
            limit=1
        )
        
        if subscriptions.data:
            sub = subscriptions.data[0]
            return {
                "status": "active",
                "current_period_end": sub.current_period_end,
                "cancel_at_period_end": sub.cancel_at_period_end
            }
        
        return {"status": "free"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/create-checkout-session")
async def create_checkout_session(
    price_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create Stripe checkout session"""
    if not settings.STRIPE_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Billing is not enabled"
        )
    
    try:
        # Get or create stripe customer
        profile = await db.table("profiles").select("stripe_customer_id").eq("id", current_user.id).single().execute()
        
        if profile.data and profile.data.get("stripe_customer_id"):
            customer_id = profile.data["stripe_customer_id"]
        else:
            # Create new customer
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": current_user.id}
            )
            customer_id = customer.id
            
            # Save customer id
            await db.table("profiles").update({"stripe_customer_id": customer_id}).eq("id", current_user.id).execute()
        
        # Map price_id to actual Stripe price IDs
        price_map = {
            "price_monthly": settings.STRIPE_PRICE_ID_MONTHLY,
            "price_yearly": settings.STRIPE_PRICE_ID_YEARLY
        }
        
        actual_price_id = price_map.get(price_id)
        if not actual_price_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid price ID"
            )
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": actual_price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{settings.APP_URL}/billing?success=true",
            cancel_url=f"{settings.APP_URL}/billing?canceled=true",
            metadata={"user_id": current_user.id}
        )
        
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/create-portal-session")
async def create_portal_session(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create Stripe customer portal session"""
    if not settings.STRIPE_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Billing is not enabled"
        )
    
    try:
        # Get user's stripe customer id
        profile = await db.table("profiles").select("stripe_customer_id").eq("id", current_user.id).single().execute()
        
        if not profile.data or not profile.data.get("stripe_customer_id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No billing account found"
            )
        
        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=profile.data["stripe_customer_id"],
            return_url=f"{settings.APP_URL}/billing"
        )
        
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db = Depends(get_db)):
    """Handle Stripe webhooks"""
    if not settings.STRIPE_ENABLED or not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhooks not configured"
        )
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # Update user subscription status
        user_id = session["metadata"]["user_id"]
        await db.table("profiles").update({
            "subscription_status": "active"
        }).eq("id", user_id).execute()
    
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        # Update subscription status
        customer_id = subscription["customer"]
        profile = await db.table("profiles").select("id").eq("stripe_customer_id", customer_id).single().execute()
        if profile.data:
            await db.table("profiles").update({
                "subscription_status": subscription["status"]
            }).eq("id", profile.data["id"]).execute()
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        # Cancel subscription
        customer_id = subscription["customer"]
        profile = await db.table("profiles").select("id").eq("stripe_customer_id", customer_id).single().execute()
        if profile.data:
            await db.table("profiles").update({
                "subscription_status": "cancelled"
            }).eq("id", profile.data["id"]).execute()
    
    return {"status": "success"}
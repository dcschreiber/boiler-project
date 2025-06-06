from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import Login, PasswordReset, Token
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(credentials: Login, db = Depends(get_db)):
    """Login with email and password"""
    try:
        # Authenticate with Supabase
        response = await db.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        return Token(
            access_token=response.session.access_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/signup", response_model=Token)
async def signup(credentials: Login, db = Depends(get_db)):
    """Create new account"""
    try:
        # Check whitelist mode
        if settings.WHITELIST_MODE:
            # Check if user is in whitelist
            whitelist = await db.table("whitelist").select("*").eq("email", credentials.email).execute()
            if not whitelist.data:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Registration is by invitation only"
                )
        
        # Create user with Supabase
        response = await db.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create account"
            )
        
        # Create profile
        await db.table("profiles").insert({
            "id": response.user.id,
            "email": credentials.email,
            "is_admin": credentials.email == settings.ADMIN_EMAIL
        }).execute()
        
        return Token(
            access_token=response.session.access_token,
            user={
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/reset-password")
async def reset_password(data: PasswordReset, db = Depends(get_db)):
    """Send password reset email"""
    try:
        await db.auth.reset_password_for_email(
            data.email,
            {
                "redirect_to": f"{settings.APP_URL}/reset-password"
            }
        )
        return {"message": "Password reset email sent"}
    except Exception as e:
        # Don't reveal if email exists or not
        return {"message": "Password reset email sent"}


@router.post("/logout")
async def logout(db = Depends(get_db)):
    """Logout current user"""
    try:
        await db.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception:
        return {"message": "Logged out successfully"}
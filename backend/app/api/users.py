from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.schemas.user import User, UserUpdate
from app.api.deps import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.get("/me", response_model=User)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update current user profile"""
    try:
        # Update profile
        update_data = user_update.dict(exclude_unset=True)
        if update_data:
            await db.table("profiles").update(update_data).eq("id", current_user.id).execute()
        
        # Return updated user
        profile = await db.table("profiles").select("*").eq("id", current_user.id).single().execute()
        
        return User(
            id=current_user.id,
            email=current_user.email,
            name=profile.data.get("name"),
            is_admin=profile.data.get("is_admin", False),
            created_at=current_user.created_at,
            language=profile.data.get("language", "en")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile"
        )


@router.delete("/me")
async def delete_current_user(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete current user account"""
    try:
        # Delete user (cascade will handle related data)
        await db.auth.admin.delete_user(current_user.id)
        return {"message": "Account deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete account"
        )


@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get user statistics for dashboard"""
    try:
        # Total users
        total_users = await db.table("profiles").select("id", count="exact").execute()
        
        # New users this week
        from datetime import datetime, timedelta
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        new_users_week = await db.table("profiles").select("id", count="exact").gte("created_at", week_ago).execute()
        
        # Active users today (simplified - you'd track this differently in production)
        today = datetime.utcnow().date().isoformat()
        active_users = await db.table("profiles").select("id", count="exact").gte("updated_at", today).execute()
        
        return {
            "totalUsers": total_users.count or 0,
            "newUsersThisWeek": new_users_week.count or 0,
            "activeUsersToday": active_users.count or 0
        }
    except Exception as e:
        return {
            "totalUsers": 0,
            "newUsersThisWeek": 0,
            "activeUsersToday": 0
        }
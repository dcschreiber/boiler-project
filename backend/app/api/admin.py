from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from app.schemas.user import User, UserList
from app.api.deps import get_current_admin_user
from app.core.database import get_db
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/users", response_model=UserList)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """List all users with pagination and filters"""
    try:
        # Build query
        query = db.table("profiles").select("*")
        
        # Apply filters
        if search:
            query = query.or_(f"email.ilike.%{search}%,name.ilike.%{search}%")
        
        if role == "admin":
            query = query.eq("is_admin", True)
        elif role == "user":
            query = query.eq("is_admin", False)
        
        # Get total count
        count_result = await query.count()
        total = count_result.count or 0
        
        # Apply pagination
        offset = (page - 1) * per_page
        query = query.range(offset, offset + per_page - 1)
        
        # Execute query
        result = await query.execute()
        
        # Convert to User objects
        users = []
        for profile in result.data:
            # Get auth user data
            auth_user = await db.auth.admin.get_user_by_id(profile["id"])
            users.append(User(
                id=profile["id"],
                email=auth_user.user.email,
                name=profile.get("name"),
                is_admin=profile.get("is_admin", False),
                created_at=auth_user.user.created_at,
                language=profile.get("language", "en")
            ))
        
        return UserList(
            users=users,
            total=total,
            page=page,
            per_page=per_page
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )


@router.put("/users/{user_id}/admin")
async def toggle_admin_status(
    user_id: str,
    is_admin: bool,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Make user admin or remove admin privileges"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own admin status"
        )
    
    try:
        await db.table("profiles").update({"is_admin": is_admin}).eq("id", user_id).execute()
        return {"message": f"User admin status updated to {is_admin}"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user"
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Delete a user and all their data"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        # Delete user (cascade will handle related data)
        await db.auth.admin.delete_user(user_id)
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete user"
        )


@router.get("/users/export")
async def export_users(
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Export all users to CSV"""
    try:
        # Get all profiles
        result = await db.table("profiles").select("*").execute()
        
        # Create CSV
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["ID", "Email", "Name", "Admin", "Language", "Created At"])
        
        # Write data
        for profile in result.data:
            # Get auth user data
            auth_user = await db.auth.admin.get_user_by_id(profile["id"])
            writer.writerow([
                profile["id"],
                auth_user.user.email,
                profile.get("name", ""),
                "Yes" if profile.get("is_admin", False) else "No",
                profile.get("language", "en"),
                auth_user.user.created_at
            ])
        
        # Return CSV file
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users.csv"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export users"
        )


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """Get admin dashboard statistics"""
    try:
        # Total users
        total_users = await db.table("profiles").select("id", count="exact").execute()
        
        # New users this week
        from datetime import datetime, timedelta
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        new_users_week = await db.table("profiles").select("id", count="exact").gte("created_at", week_ago).execute()
        
        # New users this month
        month_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        new_users_month = await db.table("profiles").select("id", count="exact").gte("created_at", month_ago).execute()
        
        # Active users today
        today = datetime.utcnow().date().isoformat()
        active_today = await db.table("profiles").select("id", count="exact").gte("updated_at", today).execute()
        
        return {
            "totalUsers": total_users.count or 0,
            "newUsersThisWeek": new_users_week.count or 0,
            "newUsersThisMonth": new_users_month.count or 0,
            "activeUsersToday": active_today.count or 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch statistics"
        )
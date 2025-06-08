from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from app.core.security import decode_token
from app.core.database import get_db
from app.schemas.user import User
from app.core.config import settings

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    
    try:
        # Verify token with Supabase (not async)
        user_response = db.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Try to get user profile, but don't fail if table doesn't exist
        profile_data = None
        try:
            profile = await db.table("profiles").select("*").eq("id", user_response.user.id).single().execute()
            profile_data = profile.data
        except Exception as profile_error:
            print(f"Profile query failed (table may not exist): {profile_error}")
            # Continue without profile data - we'll use email-based admin check
        
        # Determine admin status - first check profile data, then fall back to email
        is_admin = False
        if profile_data:
            is_admin = profile_data.get("is_admin", False)
        else:
            # Fall back to email-based admin check if no profile data
            is_admin = user_response.user.email == settings.ADMIN_EMAIL
        
        return User(
            id=user_response.user.id,
            email=user_response.user.email,
            name=profile_data.get("name") if profile_data else None,
            is_admin=is_admin,
            created_at=user_response.user.created_at,
            language=profile_data.get("language", "en") if profile_data else "en"
        )
    except HTTPException:
        # Re-raise HTTP exceptions (like invalid token)
        raise
    except Exception as e:
        print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
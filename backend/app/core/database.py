from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from supabase import create_client, Client
from app.core.config import settings

Base = declarative_base()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def init_db():
    """Initialize database tables and admin user"""
    try:
        # Check if admin user exists
        result = supabase.auth.admin.list_users()
        
        # Handle different response formats
        users_list = result.users if hasattr(result, 'users') else result
        admin_exists = any(
            getattr(user, 'email', None) == settings.ADMIN_EMAIL for user in users_list
        )
        
        if not admin_exists and settings.ADMIN_EMAIL:
            # Create admin user with temporary password
            temp_password = "ChangeMeNow123!"
            supabase.auth.admin.create_user({
                "email": settings.ADMIN_EMAIL,
                "password": temp_password,
                "email_confirm": True,
                "user_metadata": {"is_admin": True}
            })
            print(f"Admin user created: {settings.ADMIN_EMAIL}")
            print(f"Temporary password: {temp_password}")
            print("Please change this password immediately!")
    except Exception as e:
        print(f"Error initializing database: {e}")


async def get_db():
    """Dependency to get Supabase client"""
    return supabase
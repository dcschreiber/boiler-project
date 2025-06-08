#!/usr/bin/env python3
"""
Simple script to check database status and create profile if needed.
"""
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def simple_db_check():
    """Simple database check and profile creation."""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY')
    admin_email = os.getenv('ADMIN_EMAIL')
    
    if not all([supabase_url, supabase_service_key]):
        print("❌ Missing required environment variables")
        return False
    
    try:
        # Create Supabase client with service key (admin access)
        supabase: Client = create_client(supabase_url, supabase_service_key)
        
        print(f"🔍 Checking for admin user: {admin_email}")
        
        # Get the admin user from auth
        try:
            # List all users and find the admin
            users_response = supabase.auth.admin.list_users()
            admin_user = None
            
            print(f"Found {len(users_response)} users in auth")
            
            for user in users_response:
                print(f"User: {user.email} (ID: {user.id})")
                if user.email == admin_email:
                    admin_user = user
                    break
            
            if admin_user:
                print(f"✅ Admin user found: {admin_user.id}")
                
                # Check if profiles table exists by trying to query it
                try:
                    profile = supabase.table("profiles").select("*").eq("id", admin_user.id).maybe_single().execute()
                    print("✅ Profiles table exists")
                    
                    if profile.data:
                        if not profile.data.get("is_admin"):
                            # Update to make admin
                            supabase.table("profiles").update({"is_admin": True}).eq("id", admin_user.id).execute()
                            print("✅ Updated user to admin")
                        else:
                            print("✅ User is already admin")
                    else:
                        # Create profile
                        result = supabase.table("profiles").insert({
                            "id": admin_user.id,
                            "is_admin": True
                        }).execute()
                        print("✅ Created admin profile")
                        print(f"Profile created: {result.data}")
                        
                except Exception as profile_error:
                    print(f"❌ Profiles table issue: {profile_error}")
                    print("📝 You need to create the profiles table in Supabase SQL editor:")
                    print("""
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name text,
    is_admin boolean DEFAULT false,
    language text DEFAULT 'en',
    stripe_customer_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies  
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
                    """)
                    return False
            else:
                print(f"⚠️  Admin user not found in auth. Please sign up with {admin_email} first.")
                return False
        except Exception as e:
            print(f"⚠️  Could not check admin user: {e}")
            return False
        
        print("✅ Database check completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

if __name__ == "__main__":
    success = simple_db_check()
    sys.exit(0 if success else 1) 
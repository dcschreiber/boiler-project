#!/usr/bin/env python3
"""
Database setup script for the SaaS boilerplate.
Creates required tables and sets up the admin user.
"""
import os
import sys
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def setup_database():
    """Set up database tables and admin user."""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY')
    admin_email = os.getenv('ADMIN_EMAIL')
    
    if not all([supabase_url, supabase_service_key]):
        print("❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY")
        print("   Make sure .env.local is properly configured")
        return False
    
    if not admin_email:
        print("⚠️  No ADMIN_EMAIL set - admin user won't be created")
    
    try:
        # Create Supabase client with service key (admin access)
        supabase: Client = create_client(supabase_url, supabase_service_key)
        
        print("🔍 Setting up database...")
        
        # Check if profiles table exists
        try:
            result = supabase.table("profiles").select("id").limit(1).execute()
            print("✅ Profiles table already exists")
            profiles_exist = True
        except Exception:
            profiles_exist = False
        
        # Create profiles table if it doesn't exist
        if not profiles_exist:
            print("🛠️  Creating profiles table...")
            
            # Create the table using insert/upsert approach since direct SQL might not work
            # We'll create a dummy record to establish the table structure
            try:
                # Try to create table structure by inserting a record
                # This will fail gracefully if table doesn't exist, then we know we need manual setup
                test_result = supabase.table("profiles").select("id").limit(1).execute()
                print("✅ Profiles table exists")
            except Exception as e:
                print("❌ Profiles table doesn't exist and needs to be created manually")
                print("\n📝 Please run this SQL in your Supabase SQL Editor:")
                print("=" * 60)
                print("""
-- Create profiles table
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

-- Create admin policies for admin users
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
""")
                print("=" * 60)
                print("\n🔄 After creating the table, run this script again")
                return False
        
        # Set up admin user if specified
        if admin_email:
            print(f"🔍 Setting up admin user: {admin_email}")
            
            # Get all users and find the admin
            try:
                users_response = supabase.auth.admin.list_users()
                admin_user = None
                
                for user in users_response:
                    if user.email == admin_email:
                        admin_user = user
                        break
                
                if admin_user:
                    print(f"✅ Admin user found: {admin_user.id}")
                    
                    # Check if profile exists
                    try:
                        profile = supabase.table("profiles").select("*").eq("id", admin_user.id).maybe_single().execute()
                        
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
                            
                    except Exception as e:
                        print(f"⚠️  Could not set up admin profile: {e}")
                        print("   The user will still have admin access via email-based fallback")
                else:
                    print(f"⚠️  Admin user not found. Please:")
                    print(f"   1. Go to your app and sign up with {admin_email}")
                    print(f"   2. Run this script again to set up admin privileges")
            except Exception as e:
                print(f"⚠️  Could not check admin user: {e}")
        
        print("✅ Database setup completed successfully")
        print("\n🚀 Your application is ready to use!")
        if admin_email:
            print(f"   Admin user: {admin_email}")
        print("   Backend: http://localhost:8000")
        print("   Frontend: http://localhost:5173")
        print("   API Docs: http://localhost:8000/api/docs")
        
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1) 
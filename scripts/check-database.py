#!/usr/bin/env python3
"""
Script to check and setup the database tables required for the application.
"""
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def check_and_setup_database():
    """Check if required tables exist and create them if needed."""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY')
    admin_email = os.getenv('ADMIN_EMAIL')
    
    if not all([supabase_url, supabase_service_key]):
        print("❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY")
        return False
    
    try:
        # Create Supabase client with service key (admin access)
        supabase: Client = create_client(supabase_url, supabase_service_key)
        
        print("🔍 Checking database tables...")
        
        # Check if profiles table exists
        try:
            result = supabase.table("profiles").select("id").limit(1).execute()
            print("✅ Profiles table exists")
            profiles_exist = True
        except Exception as e:
            print(f"❌ Profiles table doesn't exist: {e}")
            profiles_exist = False
        
        # Create profiles table if it doesn't exist
        if not profiles_exist:
            print("🛠️  Creating profiles table...")
            
            # SQL to create profiles table
            create_profiles_sql = """
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
            """
            
            try:
                supabase.postgrest.rpc('exec_sql', {'sql': create_profiles_sql}).execute()
                print("✅ Profiles table created successfully")
            except Exception as e:
                print(f"❌ Failed to create profiles table: {e}")
                # Try alternative approach using direct SQL
                try:
                    supabase.table("profiles").insert({
                        "id": "00000000-0000-0000-0000-000000000000",
                        "name": "test"
                    }).execute()
                    print("✅ Profiles table appears to be working")
                except Exception as e2:
                    print(f"❌ Profiles table still not working: {e2}")
                    return False
        
        # Create admin user profile if admin email is provided
        if admin_email:
            print(f"🔍 Checking for admin user: {admin_email}")
            
            # Get the admin user from auth
            try:
                # List all users and find the admin
                users = supabase.auth.admin.list_users()
                admin_user = None
                for user in users:
                    if user.email == admin_email:
                        admin_user = user
                        break
                
                if admin_user:
                    print(f"✅ Admin user found: {admin_user.id}")
                    
                    # Check if profile exists
                    try:
                        profile = supabase.table("profiles").select("*").eq("id", admin_user.id).single().execute()
                        if profile.data:
                            if not profile.data.get("is_admin"):
                                # Update to make admin
                                supabase.table("profiles").update({"is_admin": True}).eq("id", admin_user.id).execute()
                                print("✅ Updated user to admin")
                            else:
                                print("✅ User is already admin")
                        else:
                            # Create profile
                            supabase.table("profiles").insert({
                                "id": admin_user.id,
                                "is_admin": True
                            }).execute()
                            print("✅ Created admin profile")
                    except Exception as e:
                        # Create profile
                        try:
                            supabase.table("profiles").insert({
                                "id": admin_user.id,
                                "is_admin": True
                            }).execute()
                            print("✅ Created admin profile")
                        except Exception as e2:
                            print(f"⚠️  Could not create admin profile: {e2}")
                else:
                    print(f"⚠️  Admin user not found in auth. Please sign up with {admin_email} first.")
            except Exception as e:
                print(f"⚠️  Could not check admin user: {e}")
        
        print("✅ Database check completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

if __name__ == "__main__":
    success = check_and_setup_database()
    sys.exit(0 if success else 1) 
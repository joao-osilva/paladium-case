-- PaxBnb Database Functions
-- This file contains custom functions and triggers for the PaxBnb application

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_type_value TEXT;
BEGIN
    -- Extract values with safe fallbacks
    user_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        'PaxBnb User'
    );
    
    user_type_value := COALESCE(
        NEW.raw_user_meta_data->>'user_type',
        'guest'
    );

    -- Log what we're working with (for debugging)
    RAISE LOG 'Creating profile for user %. Email: %. Full name: %. User type: %. Raw metadata: %', 
        NEW.id, NEW.email, user_full_name, user_type_value, NEW.raw_user_meta_data;

    -- Insert the profile
    INSERT INTO public.profiles (id, email, full_name, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        user_full_name,
        user_type_value::user_type_enum
    );

    RAISE LOG 'Successfully created profile for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error in detail
        RAISE LOG 'PROFILE CREATION ERROR for user %: SQLSTATE: %, SQLERRM: %, Raw metadata: %', 
            NEW.id, SQLSTATE, SQLERRM, NEW.raw_user_meta_data;
        
        -- Try a minimal insert as fallback
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, user_type)
            VALUES (
                NEW.id,
                COALESCE(NEW.email, 'unknown@example.com'),
                'PaxBnb User',
                'guest'::user_type_enum
            );
            RAISE LOG 'Fallback profile creation succeeded for user %', NEW.id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE LOG 'FALLBACK ALSO FAILED for user %: %', NEW.id, SQLERRM;
        END;
        
        -- CRITICAL: Always return NEW to prevent signup failure
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if email already has a profile
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    email_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO email_count
    FROM profiles
    WHERE email = email_to_check;
    
    RETURN email_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with role
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    user_type user_type_enum,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.user_type,
        p.phone,
        p.avatar_url,
        p.bio,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
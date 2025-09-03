-- PaxBnb Complete Database Schema
-- This file contains the complete database setup for the PaxBnb application
-- Run this once in your Supabase SQL Editor to set up everything

-- ==========================================
-- 1. TYPES AND ENUMS
-- ==========================================

CREATE TYPE user_type_enum AS ENUM ('host', 'guest');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    user_type user_type_enum NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Properties table
CREATE TABLE properties (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_per_night NUMERIC(10,2) NOT NULL,
    max_guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    beds INTEGER NOT NULL,
    bathrooms NUMERIC(3,1) NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    location_type TEXT CHECK (location_type IN ('beach', 'countryside', 'city', 'mountain', 'lakeside', 'desert')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT properties_pkey PRIMARY KEY (id),
    CONSTRAINT properties_host_id_fkey FOREIGN KEY (host_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT properties_beds_check CHECK (beds > 0),
    CONSTRAINT properties_bathrooms_check CHECK (bathrooms > 0::numeric),
    CONSTRAINT properties_max_guests_check CHECK (max_guests > 0),
    CONSTRAINT properties_bedrooms_check CHECK (bedrooms >= 0),
    CONSTRAINT properties_price_per_night_check CHECK (price_per_night > 0::numeric)
);

-- Property images table
CREATE TABLE property_images (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    url TEXT NOT NULL,
    display_order INTEGER NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT property_images_pkey PRIMARY KEY (id),
    CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    guest_id UUID NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status booking_status_enum NOT NULL DEFAULT 'confirmed'::booking_status_enum,
    guest_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT bookings_pkey PRIMARY KEY (id),
    CONSTRAINT bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT valid_date_range CHECK (check_out > check_in),
    CONSTRAINT bookings_guest_count_check CHECK (guest_count > 0),
    CONSTRAINT bookings_total_price_check CHECK (total_price > 0::numeric),
    CONSTRAINT bookings_property_id_daterange_excl EXCLUDE USING gist (
        property_id WITH =,
        daterange(check_in, check_out, '[)'::text) WITH &&
    ) WHERE (status = 'confirmed'::booking_status_enum)
);

-- ==========================================
-- 3. INDEXES FOR PERFORMANCE
-- ==========================================

-- Profiles indexes
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_user_type_idx ON profiles(user_type);
CREATE INDEX profiles_created_at_idx ON profiles(created_at);

-- Properties indexes
CREATE INDEX IF NOT EXISTS properties_host_id_idx ON properties USING btree (host_id);

-- Property images indexes
CREATE INDEX IF NOT EXISTS property_images_property_id_idx ON property_images USING btree (property_id);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS bookings_property_id_idx ON bookings USING btree (property_id);
CREATE INDEX IF NOT EXISTS bookings_guest_id_idx ON bookings USING btree (guest_id);
CREATE INDEX IF NOT EXISTS bookings_check_in_idx ON bookings USING btree (check_in);
CREATE INDEX IF NOT EXISTS bookings_check_out_idx ON bookings USING btree (check_out);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings USING btree (status);
CREATE INDEX IF NOT EXISTS bookings_date_range_idx ON bookings USING gist (daterange(check_in, check_out, '[)'::text));

-- ==========================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view host profiles" ON profiles
    FOR SELECT USING (user_type = 'host');

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view properties" ON properties
    FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own properties" ON properties
    FOR ALL USING (auth.uid() = host_id);

-- Property images policies
CREATE POLICY "Anyone can view property images" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own property images" ON property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = property_images.property_id 
            AND p.host_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "Users can view own bookings as guest" ON bookings
    FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can view bookings for their properties" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = bookings.property_id 
            AND p.host_id = auth.uid()
        )
    );

CREATE POLICY "Guests can insert bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Guests can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can update bookings for their properties" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = bookings.property_id 
            AND p.host_id = auth.uid()
        )
    );

-- ==========================================
-- 5. FUNCTIONS AND TRIGGERS
-- ==========================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_type_value TEXT;
BEGIN
    -- Extract values with safe fallbacks
    user_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        SPLIT_PART(NEW.email, '@', 1),
        'PaxBnb User'
    );
    
    user_type_value := COALESCE(
        NEW.raw_user_meta_data->>'user_type',
        'guest'
    );

    -- Insert the profile
    INSERT INTO public.profiles (id, email, full_name, user_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        user_full_name,
        user_type_value::public.user_type_enum
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        user_type = EXCLUDED.user_type,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback: create minimal profile to prevent signup failure
        INSERT INTO public.profiles (id, email, full_name, user_type)
        VALUES (
            NEW.id,
            COALESCE(NEW.email, 'unknown@example.com'),
            'PaxBnb User',
            'guest'::user_type_enum
        )
        ON CONFLICT (id) DO NOTHING;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- ==========================================
-- 6. STORAGE SETUP
-- ==========================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, '{"image/jpeg", "image/png", "image/gif"}'),
    ('property-images', 'property-images', true, 10485760, '{"image/jpeg", "image/png", "image/webp"}')
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view all avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Property images storage policies  
CREATE POLICY "Hosts can upload property images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'property-images' AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.host_id = auth.uid() 
            AND p.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Anyone can view property images" ON storage.objects
    FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Hosts can update own property images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'property-images' AND
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.host_id = auth.uid() 
            AND p.id::text = (storage.foldername(name))[1]
        )
    );

-- ==========================================
-- 7. DATA FIXES (run once)
-- ==========================================

-- Fix any existing users without profiles
INSERT INTO public.profiles (id, email, full_name, user_type)
SELECT 
    au.id,
    au.email,
    COALESCE(
        NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), ''),
        SPLIT_PART(au.email, '@', 1),
        'PaxBnb User'
    ),
    COALESCE(
        au.raw_user_meta_data->>'user_type',
        'guest'
    )::user_type_enum
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. VERIFICATION
-- ==========================================

-- Check everything is set up correctly
SELECT 
    'Setup Complete!' as status,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM properties) as total_properties,
    (SELECT COUNT(*) FROM bookings) as total_bookings;

-- Verify trigger is active
SELECT 
    trigger_name,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Database setup completed successfully! You can now use your PaxBnb application.' as final_message;
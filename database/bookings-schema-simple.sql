-- Bookings Schema for PaxBnb Property Availability System (Simplified Version)
-- Use this version if you have issues with the btree_gist extension

-- Create booking status enum (skip if already exists)
DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create bookings table (without overlapping constraint)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
    status booking_status_enum DEFAULT 'confirmed' NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure check-out is after check-in
    CONSTRAINT valid_date_range CHECK (check_out > check_in)
);

-- Create a unique constraint to prevent exact duplicate bookings
ALTER TABLE bookings ADD CONSTRAINT unique_booking 
    UNIQUE (property_id, check_in, check_out, guest_id);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Hosts can view bookings for their properties
CREATE POLICY "Hosts can view their property bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = bookings.property_id 
            AND properties.host_id = auth.uid()
        )
    );

-- RLS Policy: Guests can view their own bookings
CREATE POLICY "Guests can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = guest_id);

-- RLS Policy: Guests can insert their own bookings
CREATE POLICY "Guests can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = guest_id);

-- RLS Policy: Guests can update their own bookings (for cancellations)
CREATE POLICY "Guests can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = guest_id);

-- RLS Policy: Hosts can update bookings for their properties (for status changes)
CREATE POLICY "Hosts can update their property bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = bookings.property_id 
            AND properties.host_id = auth.uid()
        )
    );

-- Create performance indexes
CREATE INDEX IF NOT EXISTS bookings_property_id_idx ON bookings(property_id);
CREATE INDEX IF NOT EXISTS bookings_guest_id_idx ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS bookings_check_in_idx ON bookings(check_in);
CREATE INDEX IF NOT EXISTS bookings_check_out_idx ON bookings(check_out);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS bookings_property_dates_idx ON bookings(property_id, check_in, check_out);

-- Update trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check for overlapping bookings (can be called from application)
CREATE OR REPLACE FUNCTION check_booking_overlap(
    p_property_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_exclude_booking_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM bookings
        WHERE property_id = p_property_id
        AND status = 'confirmed'
        AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
        AND (
            (check_in <= p_check_in AND check_out > p_check_in) OR
            (check_in < p_check_out AND check_out >= p_check_out) OR
            (check_in >= p_check_in AND check_out <= p_check_out)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Sample booking data for testing
-- Note: Replace these UUIDs with actual user/property IDs from your database
-- You can get property IDs with: SELECT id, title FROM properties LIMIT 5;
-- You can get guest IDs with: SELECT id, full_name FROM profiles WHERE user_type = 'guest' LIMIT 5;

-- Example insert (uncomment and modify with real IDs):
-- INSERT INTO bookings (property_id, guest_id, check_in, check_out, total_price, guest_count) VALUES
-- ('your-property-uuid', 'your-guest-uuid', '2024-03-15', '2024-03-18', 450.00, 2),
-- ('your-property-uuid', 'your-guest-uuid', '2024-03-25', '2024-03-28', 600.00, 4);
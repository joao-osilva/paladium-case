-- Bookings Schema for PaxBnb Property Availability System

-- Enable btree_gist extension for preventing overlapping bookings
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create booking status enum (skip if already exists)
DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM ('confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create bookings table
CREATE TABLE bookings (
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
    CONSTRAINT valid_date_range CHECK (check_out > check_in),
    
    -- Prevent overlapping bookings for the same property
    EXCLUDE USING gist (
        property_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status = 'confirmed')
);

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
CREATE INDEX bookings_property_id_idx ON bookings(property_id);
CREATE INDEX bookings_guest_id_idx ON bookings(guest_id);
CREATE INDEX bookings_check_in_idx ON bookings(check_in);
CREATE INDEX bookings_check_out_idx ON bookings(check_out);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_date_range_idx ON bookings USING gist (daterange(check_in, check_out, '[)'));

-- Update trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample booking data for testing
-- Note: These UUIDs are placeholders - replace with actual user/property IDs when testing
INSERT INTO bookings (property_id, guest_id, check_in, check_out, total_price, guest_count) VALUES
-- Sample bookings for March 2024 (replace UUIDs with real ones)
-- ('property-uuid-1', 'guest-uuid-1', '2024-03-15', '2024-03-18', 450.00, 2),
-- ('property-uuid-1', 'guest-uuid-2', '2024-03-25', '2024-03-28', 600.00, 4),
-- ('property-uuid-2', 'guest-uuid-3', '2024-03-10', '2024-03-12', 300.00, 1);

-- Note: Uncomment and update the INSERT statements above with real UUIDs from your database
-- You can get property IDs with: SELECT id, title FROM properties LIMIT 5;
-- You can get guest IDs with: SELECT id, full_name FROM profiles WHERE user_type = 'guest' LIMIT 5;
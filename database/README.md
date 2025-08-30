# PaxBnb Database Setup

## Quick Start

1. **Copy and paste `complete-schema.sql` into your Supabase SQL Editor**
2. **Run it once** - this sets up everything you need
3. **Done!** Your database is ready

## What's Included

The single `complete-schema.sql` file contains:

- **Tables**: profiles, properties, property_images, bookings
- **Security**: Row Level Security policies for data protection
- **Functions**: Automatic profile creation on user signup
- **Storage**: File upload buckets for avatars and property images
- **Indexes**: Performance optimizations for common queries

## Database Schema

```
profiles (users extend auth.users)
├── id, email, full_name, user_type (host/guest)
├── phone, avatar_url, bio
└── created_at, updated_at

properties (host listings)
├── host_id → profiles.id
├── title, description
├── price_per_night, bedrooms, beds, bathrooms (numeric), max_guests
└── address, city, country

property_images (property photos)
├── property_id → properties.id
├── url, display_order
└── created_at

bookings (guest reservations)
├── property_id → properties.id
├── guest_id → profiles.id  
├── check_in, check_out, guest_count
├── total_price, status (confirmed by default)
├── created_at, updated_at
└── date range exclusion constraint (prevents double-bookings)
```

## User Types

- **Guest**: Can browse properties and make bookings
- **Host**: Can list properties and manage bookings

## Security

- Users can only see their own data
- Host profiles are publicly visible (for property listings)
- Published properties are publicly visible
- Bookings are only visible to guest and property host

## Troubleshooting

### Profile not created after signup
```sql
-- Check if user exists but profile missing
SELECT au.id, au.email 
FROM auth.users au 
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);
```

### Check if everything is working
```sql
-- Verify setup
SELECT 
    (SELECT COUNT(*) FROM auth.users) as users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM properties) as properties;
```

That's it! Keep it simple. 🏠
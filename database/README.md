# PaxBnb Database Setup

This directory contains all the database schema definitions and setup scripts for the PaxBnb application.

## Files

- `schema.sql` - Main database schema including tables, enums, and RLS policies
- `functions.sql` - Custom database functions and triggers
- `migrations/` - Directory for future migration scripts

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the SQL scripts in the following order:

### 2. Database Schema Setup

Execute the following files in order:

1. **schema.sql** - Creates the main database structure
   ```sql
   -- Copy and paste the contents of schema.sql into Supabase SQL Editor
   ```

2. **functions.sql** - Creates custom functions and triggers
   ```sql
   -- Copy and paste the contents of functions.sql into Supabase SQL Editor
   ```

### 3. Environment Variables

Ensure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema Overview

### Tables

#### `profiles`
- Extends Supabase's `auth.users` table
- Stores user profile information and role (host/guest)
- Has RLS policies for data security
- Automatically created via trigger when user signs up

### Enums

#### `user_type_enum`
- `host` - Users who can list properties
- `guest` - Users who can make reservations

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own profile data
- Automatic profile creation upon user registration
- Email uniqueness is enforced

## Key Features

1. **Single Registration Per Email**: Each email can only register once with a specific role
2. **Automatic Profile Creation**: Profiles are created automatically when users sign up
3. **Role-Based Access**: Different access patterns for hosts and guests
4. **Data Security**: RLS policies ensure users only access their own data

## Future Enhancements

This schema is designed to be extended with:
- Properties table (for host listings)
- Bookings table (for guest reservations)
- Reviews and ratings system
- Payment tracking
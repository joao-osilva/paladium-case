import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user is a guest
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile || profile.user_type !== 'guest') {
      return NextResponse.json(
        { error: 'Only guests can create bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { property_id, check_in, check_out, guest_count, total_price } = body

    // Validate required fields
    if (!property_id || !check_in || !check_out || !guest_count || !total_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      )
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      )
    }

    // Verify property exists and get max guests
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, max_guests, price_per_night')
      .eq('id', property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Validate guest count
    if (guest_count > property.max_guests) {
      return NextResponse.json(
        { error: `Property can accommodate maximum ${property.max_guests} guests` },
        { status: 400 }
      )
    }

    // Check for overlapping bookings directly
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', property_id)
      .eq('status', 'confirmed')
      .or(`and(check_in.lt.${check_out},check_out.gt.${check_in})`)

    if (overlapError) {
      console.error('Error checking overlap:', overlapError)
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      )
    }

    if (overlappingBookings && overlappingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Property is not available for the selected dates' },
        { status: 409 }
      )
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          property_id,
          guest_id: user.id,
          check_in,
          check_out,
          guest_count: parseInt(guest_count),
          total_price: parseFloat(total_price),
          status: 'confirmed'
        }
      ])
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      
      // Handle specific database errors
      if (bookingError.message?.includes('overlapping') || bookingError.code === '23P01') {
        return NextResponse.json(
          { error: 'Property is not available for the selected dates' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        guest_count,
        total_price,
        status,
        created_at,
        property:properties (
          id,
          title,
          city,
          country,
          property_images (
            url,
            display_order
          ),
          profiles:host_id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('guest_id', user.id)
      .order('check_in', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    const guests = searchParams.get('guests')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const bedrooms = searchParams.get('bedrooms')

    const supabase = createClient()
    
    // Start with base query
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        price_per_night,
        bedrooms,
        beds,
        bathrooms,
        max_guests,
        address,
        city,
        country,
        created_at,
        property_images (
          url,
          display_order
        ),
        profiles:host_id (
          full_name,
          avatar_url
        )
      `)

    // Apply location filter
    if (location) {
      query = query.or(`city.ilike.%${location}%,country.ilike.%${location}%,title.ilike.%${location}%`)
    }
    
    // Apply guest count filter
    if (guests) {
      const guestCount = parseInt(guests)
      if (!isNaN(guestCount)) {
        query = query.gte('max_guests', guestCount)
      }
    }

    // Apply bedroom filter
    if (bedrooms) {
      const bedroomCount = parseInt(bedrooms)
      if (!isNaN(bedroomCount)) {
        query = query.gte('bedrooms', bedroomCount)
      }
    }

    // Apply price filters
    if (minPrice) {
      const min = parseFloat(minPrice)
      if (!isNaN(min)) {
        query = query.gte('price_per_night', min)
      }
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      if (!isNaN(max)) {
        query = query.lte('price_per_night', max)
      }
    }

    const { data: properties, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    // If date range is provided, filter out properties with conflicting bookings
    if (checkin && checkout) {
      const availableProperties = []
      
      for (const property of properties || []) {
        // Check for conflicting bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('check_in, check_out')
          .eq('property_id', property.id)
          .eq('status', 'confirmed')
        
        const hasConflict = bookings?.some(booking => {
          const bookingCheckIn = new Date(booking.check_in)
          const bookingCheckOut = new Date(booking.check_out)
          const requestCheckIn = new Date(checkin)
          const requestCheckOut = new Date(checkout)
          
          return (
            (requestCheckIn >= bookingCheckIn && requestCheckIn < bookingCheckOut) ||
            (requestCheckOut > bookingCheckIn && requestCheckOut <= bookingCheckOut) ||
            (requestCheckIn <= bookingCheckIn && requestCheckOut >= bookingCheckOut)
          )
        })
        
        if (!hasConflict) {
          availableProperties.push(property)
        }
      }
      
      return NextResponse.json({ properties: availableProperties })
    }

    return NextResponse.json({ properties: properties || [] })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
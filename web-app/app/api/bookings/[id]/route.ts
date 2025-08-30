import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get booking details
    const { data: booking, error } = await supabase
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
          address,
          city,
          country,
          property_images (
            url,
            display_order
          ),
          profiles:host_id (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns this booking or is the host
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const isGuest = profile?.user_type === 'guest' && booking.guest_id === user.id
    const isHost = profile?.user_type === 'host' && booking.property.profiles?.id === user.id

    if (!isGuest && !isHost) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json()
    const { status, ...updateData } = body

    // Get current booking to verify ownership
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('guest_id, status, check_in')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user owns this booking
    if (currentBooking.guest_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Validate cancellation rules
    if (status === 'cancelled') {
      if (currentBooking.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Only confirmed bookings can be cancelled' },
          { status: 400 }
        )
      }

      const checkInDate = new Date(currentBooking.check_in)
      const today = new Date()
      const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDifference < 1) {
        return NextResponse.json(
          { error: 'Booking cannot be cancelled less than 24 hours before check-in' },
          { status: 400 }
        )
      }
    }

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status, ...updateData })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('Update booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Get current booking to verify ownership
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('guest_id, status, check_in')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user owns this booking
    if (currentBooking.guest_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Instead of deleting, mark as cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error cancelling booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Delete booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
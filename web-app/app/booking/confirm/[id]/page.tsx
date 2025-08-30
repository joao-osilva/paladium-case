import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'

interface BookingConfirmPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: 'Booking Confirmed | PaxBnb',
  description: 'Your booking has been confirmed successfully'
}

export default async function BookingConfirmPage({ params }: BookingConfirmPageProps) {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get booking details with property and host information
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
    .eq('guest_id', user.id) // Ensure user can only see their own bookings
    .single()

  if (error || !booking) {
    notFound()
  }

  return <BookingConfirmation booking={booking} />
}
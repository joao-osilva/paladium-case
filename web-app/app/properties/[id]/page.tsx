import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PropertyDetailClient } from '@/components/properties/PropertyDetailClient'

interface PropertyDetailPageProps {
  params: {
    id: string
  }
  searchParams: {
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, city, country')
    .eq('id', params.id)
    .single()

  if (!property) {
    return {
      title: 'Property Not Found | PaxBnb'
    }
  }

  return {
    title: `${property.title} in ${property.city}, ${property.country} | PaxBnb`,
    description: property.description
  }
}

export default async function PropertyDetailPage({ params, searchParams }: PropertyDetailPageProps) {
  const supabase = createClient()
  
  // Get property details with host info
  const { data: propertyData, error } = await supabase
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
      location_type,
      created_at,
      property_images (
        url,
        display_order
      ),
      profiles:host_id (
        id,
        full_name,
        avatar_url,
        created_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !propertyData) {
    notFound()
  }

  const property = propertyData

  // Get existing bookings for this property to show availability
  const { data: bookings } = await supabase
    .from('bookings')
    .select('check_in, check_out, status')
    .eq('property_id', params.id)
    .in('status', ['confirmed', 'completed'])

  return (
    <PropertyDetailClient 
      property={property as any} 
      bookings={bookings || []}
      searchParams={searchParams}
    />
  )
}
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PropertySearch } from '@/components/properties/PropertySearch'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { Header } from '@/components/layout/Header'
import { FloatingAIButton } from '@/components/ai/FloatingAIButton'

export const metadata: Metadata = {
  title: 'Browse Properties | PaxBnb',
  description: 'Discover amazing places to stay around the world'
}

interface SearchParams {
  location?: string
  checkin?: string
  checkout?: string
  guests?: string
  min_price?: string
  max_price?: string
  bedrooms?: string
  location_type?: string
}

interface PropertiesPageProps {
  searchParams: SearchParams
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const supabase = createClient()
  
  // Check authentication status
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile if authenticated
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }
  
  // Get all published properties with their images and host info
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
      location_type,
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
    .order('created_at', { ascending: false })

  // Apply filters based on search params
  if (searchParams.location) {
    query = query.or(`city.ilike.%${searchParams.location}%,country.ilike.%${searchParams.location}%`)
  }
  
  if (searchParams.guests) {
    const guestCount = parseInt(searchParams.guests)
    if (!isNaN(guestCount)) {
      query = query.gte('max_guests', guestCount)
    }
  }

  if (searchParams.bedrooms) {
    const bedroomCount = parseInt(searchParams.bedrooms)
    if (!isNaN(bedroomCount)) {
      query = query.gte('bedrooms', bedroomCount)
    }
  }

  if (searchParams.location_type) {
    query = query.eq('location_type', searchParams.location_type)
  }

  if (searchParams.min_price || searchParams.max_price) {
    const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : 0
    const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : 10000
    
    if (!isNaN(minPrice)) {
      query = query.gte('price_per_night', minPrice)
    }
    if (!isNaN(maxPrice) && maxPrice < 10000) {
      query = query.lte('price_per_night', maxPrice)
    }
  }

  const { data: properties, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600">We couldn't load the properties. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userProfile={userProfile} className="sticky top-0 z-40" />

      {/* Search Section */}
      <PropertySearch searchParams={searchParams} />
      
      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchParams.location ? `Properties in ${searchParams.location}` : 'All Properties'}
            </h1>
            <p className="text-gray-600 mt-1">
              {properties?.length || 0} properties available
            </p>
          </div>
        </div>
        
        <PropertyGrid properties={properties || []} />
      </div>

      {/* Floating AI Assistant Button */}
      <FloatingAIButton suggestedPrompt="Help me find properties that match my criteria" />
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PropertyImageGallery } from './PropertyImageGallery'
import { BookingWidget } from '../booking/BookingWidget'

interface PropertyImage {
  url: string
  display_order: number
}

interface Host {
  id: string
  full_name: string
  avatar_url?: string
  created_at: string
}

interface Property {
  id: string
  title: string
  description: string
  price_per_night: number
  bedrooms: number
  beds: number
  bathrooms: number
  max_guests: number
  address: string
  city: string
  country: string
  created_at: string
  property_images?: PropertyImage[]
  profiles?: Host
}

interface Booking {
  check_in: string
  check_out: string
  status: string
}

interface PropertyDetailClientProps {
  property: Property
  bookings: Booking[]
  searchParams: {
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export function PropertyDetailClient({ property, bookings, searchParams }: PropertyDetailClientProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [showAllPhotos, setShowAllPhotos] = useState(false)


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const images = property.property_images?.sort((a, b) => a.display_order - b.display_order) || []
  const hostJoinedYear = new Date(property.profiles?.created_at || property.created_at).getFullYear()


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to results
            </button>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Property Title */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{property.city}, {property.country}</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <PropertyImageGallery 
            images={images} 
            propertyTitle={property.title}
            isMobile={isMobile}
          />
        </div>

        {/* Main Content */}
        <div className={`grid gap-8 pb-12 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Left Column - Property Details */}
          <div className={isMobile ? 'order-2' : 'order-1 col-span-2'}>
            {/* Host Info */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Hosted by {property.profiles?.full_name || 'Host'}
                  </h2>
                  <p className="text-gray-600">
                    {property.max_guests} guests • {property.bedrooms} bedrooms • {property.beds} beds • {property.bathrooms} bathrooms
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  {property.profiles?.avatar_url ? (
                    <img
                      src={property.profiles.avatar_url}
                      alt={property.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-lg">
                        {property.profiles?.full_name ? property.profiles.full_name.charAt(0).toUpperCase() : 'H'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Description */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>


            {/* Host Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the host</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  {property.profiles?.avatar_url ? (
                    <img
                      src={property.profiles.avatar_url}
                      alt={property.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-xl">
                        {property.profiles?.full_name ? property.profiles.full_name.charAt(0).toUpperCase() : 'H'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{property.profiles?.full_name || 'Host'}</h3>
                  <p className="text-gray-600 text-sm">Joined in {hostJoinedYear}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className={isMobile ? 'order-1' : 'order-2'}>
            <div className={isMobile ? '' : 'sticky top-24'}>
              <BookingWidget
                property={property}
                bookings={bookings}
                searchParams={searchParams}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
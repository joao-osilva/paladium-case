'use client'

import { useState, useEffect } from 'react'
import { PropertyCard } from './PropertyCard'

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
  location_type?: string | null
  property_images?: { url: string; display_order: number | null }[]
  profiles?: {
    full_name: string
    avatar_url: string | null
  }
}

interface PropertyGridProps {
  properties: Property[]
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No properties found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Try adjusting your search criteria or filters to find more properties.
        </p>
        <button
          onClick={() => window.location.href = '/properties'}
          className="btn-primary"
        >
          View All Properties
        </button>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {properties.map((property) => (
        <GuestPropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}

interface GuestPropertyCardProps {
  property: Property
}

function GuestPropertyCard({ property }: GuestPropertyCardProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCardClick = () => {
    window.location.href = `/properties/${property.id}`
  }

  const getLocationTypeBadge = (locationType?: string | null) => {
    if (!locationType) return null
    
    const badges = {
      beach: { emoji: '🏖️', label: 'Beach', bg: 'bg-blue-100', text: 'text-blue-800' },
      countryside: { emoji: '🌾', label: 'Countryside', bg: 'bg-green-100', text: 'text-green-800' },
      city: { emoji: '🏙️', label: 'City', bg: 'bg-gray-100', text: 'text-gray-800' },
      mountain: { emoji: '🏔️', label: 'Mountain', bg: 'bg-purple-100', text: 'text-purple-800' },
      lakeside: { emoji: '🏞️', label: 'Lakeside', bg: 'bg-teal-100', text: 'text-teal-800' },
      desert: { emoji: '🏜️', label: 'Desert', bg: 'bg-orange-100', text: 'text-orange-800' }
    }
    
    const badge = badges[locationType as keyof typeof badges]
    return badge || null
  }

  const locationBadge = getLocationTypeBadge(property.location_type)


  return (
    <div 
      className="card-interactive cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {property.property_images && property.property_images.length > 0 ? (
          <img
            src={property.property_images[0].url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        

        {/* Host Avatar */}
        {property.profiles && (
          <div className="absolute bottom-3 left-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white border-2 border-white shadow-sm">
              {property.profiles.avatar_url ? (
                <img
                  src={property.profiles.avatar_url}
                  alt={property.profiles.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">
                    {property.profiles.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#222222] line-clamp-1 mb-1">{property.title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#717171]">{property.city}, {property.country}</p>
              {locationBadge && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${locationBadge.bg} ${locationBadge.text}`}>
                  <span>{locationBadge.emoji}</span>
                  {locationBadge.label}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-[#717171] mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{property.max_guests}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{property.bedrooms}BR • {property.bathrooms}BA</span>
          </div>
        </div>
        
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-semibold text-[#222222] text-lg">${property.price_per_night}</span>
            <span className="text-sm text-[#717171] ml-1">/ night</span>
          </div>
          
        </div>
      </div>
    </div>
  )
}
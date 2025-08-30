'use client'

import { useState, useRef, useEffect } from 'react'

interface PropertyCardProps {
  id: string
  title: string
  description: string
  price: number
  bedrooms: number
  bathrooms: number
  maxGuests: number
  imageUrl?: string
  city: string
  country: string
  showManagement?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  status?: 'published' | 'draft' | 'inactive'
  nextBooking?: {
    checkIn: string
    guestName: string
  } | null
  bookingCount?: number
}

export function PropertyCard({
  id,
  title,
  description,
  price,
  bedrooms,
  bathrooms,
  maxGuests,
  imageUrl,
  city,
  country,
  showManagement = false,
  onEdit,
  onDelete,
  status = 'published',
  nextBooking = null,
  bookingCount = 0
}: PropertyCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on management dropdown
    if (showManagement && e.currentTarget !== e.target) {
      const target = e.target as HTMLElement
      if (target.closest('.management-dropdown')) {
        return
      }
    }
    // Handle card navigation here if needed
  }

  return (
    <div 
      className={`card group ${!showManagement ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Management Actions - Only show for hosts */}
        {showManagement && (
          <div className="absolute top-2 right-2 management-dropdown">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDropdown(!showDropdown)
                }}
                className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                aria-label="Property options"
              >
                <svg className="w-5 h-5 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDropdown(false)
                      onEdit?.(id)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Property
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDropdown(false)
                      onDelete?.(id)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Property
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#222222] line-clamp-1">{title}</h3>
            <p className="text-sm text-[#717171]">{city}, {country}</p>
          </div>
        </div>
        
        {/* Next Booking Info */}
        {showManagement && nextBooking && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-blue-800 mb-1">Next Check-in</p>
            <p className="text-sm text-blue-700">
              {new Date(nextBooking.checkIn).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} • {nextBooking.guestName}
            </p>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-sm text-[#717171] mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{maxGuests}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{bedrooms}BR • {bathrooms}BA</span>
          </div>
        </div>
        
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-semibold text-[#222222] text-lg">${price}</span>
            <span className="text-sm text-[#717171] ml-1">/ night</span>
          </div>
          
          {showManagement && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(id)
                }}
                className="btn-ghost px-2 py-1 text-xs"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
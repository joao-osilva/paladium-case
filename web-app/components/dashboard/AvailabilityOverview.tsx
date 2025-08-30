'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PropertyAvailabilityCalendar } from './PropertyAvailabilityCalendar'
import type { BookingWithGuest } from '@/types/booking'

interface Property {
  id: string
  title: string
  city: string
  country: string
}

interface AvailabilityOverviewProps {
  userId: string
  properties: Property[]
}

export function AvailabilityOverview({ userId, properties }: AvailabilityOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [bookings, setBookings] = useState<BookingWithGuest[]>([])
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Set default selected property when properties change
  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id)
    }
  }, [properties, selectedPropertyId])

  // Fetch bookings for the selected property
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedPropertyId || !isExpanded) return

      setLoading(true)
      try {
        const supabase = createClient()
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            guest:profiles!bookings_guest_id_fkey (
              id,
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('property_id', selectedPropertyId)
          .in('status', ['confirmed', 'completed'])
          .order('check_in', { ascending: true })

        if (error) {
          console.error('Error fetching bookings:', error)
          setBookings([])
        } else {
          // Transform the data to match BookingWithGuest type
          const transformedBookings: BookingWithGuest[] = (bookingsData || []).map(booking => ({
            ...booking,
            guest: booking.guest as any // Type assertion since we know the structure
          }))
          setBookings(transformedBookings)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [selectedPropertyId, isExpanded])

  const selectedProperty = properties.find(p => p.id === selectedPropertyId)

  if (properties.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <svg 
            className="w-6 h-6 text-[#FF385C]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" 
            />
          </svg>
          <div className="text-left">
            <h2 className={`font-semibold text-[#222222] ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Property Availability
            </h2>
            <p className={`text-[#717171] ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isMobile ? 'Tap to view calendar' : 'View booking calendar for your properties'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {properties.length > 0 && !isMobile && (
            <span className="text-sm text-[#717171] bg-gray-100 px-3 py-1 rounded-full">
              {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
            </span>
          )}
          <svg 
            className={`w-5 h-5 text-[#717171] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Property Selector */}
          <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-200 bg-gray-50`}>
            <label className={`block font-medium text-[#222222] mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
              {isMobile ? 'Property' : 'Select Property'}
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className={`
                w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent bg-white
                ${isMobile ? 'px-4 py-3 text-base' : 'px-4 py-3'}
              `}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} • {property.city}, {property.country}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-[#FF385C]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[#717171]">Loading availability...</span>
                </div>
              </div>
            ) : selectedProperty ? (
              <>
                {/* Property Info */}
                <div className={`mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 ${isMobile ? 'text-sm' : ''}`}>
                  <h3 className={`font-semibold text-[#222222] ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {selectedProperty.title}
                  </h3>
                  <p className={`text-[#717171] ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {selectedProperty.city}, {selectedProperty.country}
                  </p>
                  <p className={`text-blue-700 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {bookings.length > 0 ? (
                      <>
                        {bookings.length} booking{bookings.length === 1 ? '' : 's'}
                        {!isMobile && ' found'}
                        {' • '}
                        {isMobile ? 'Tap booked dates' : 'Hover over booked dates for guest details'}
                      </>
                    ) : (
                      isMobile ? 'No bookings yet' : 'No bookings found for this property'
                    )}
                  </p>
                </div>

                {/* Calendar Component */}
                <PropertyAvailabilityCalendar
                  propertyId={selectedPropertyId}
                  bookings={bookings}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-[#717171]">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                  <p>No property selected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
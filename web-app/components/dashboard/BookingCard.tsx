'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface BookingWithProperty {
  id: string
  check_in: string
  check_out: string
  guest_count: number
  total_price: number
  status: string
  created_at: string
  property: {
    id: string
    title: string
    city: string
    country: string
    property_images?: { url: string; display_order: number }[]
    profiles?: {
      full_name: string
      avatar_url?: string
    }
  }
}

interface BookingCardProps {
  booking: BookingWithProperty
  onUpdate: () => void
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = () => {
    return `${formatDate(booking.check_in)} - ${formatDate(booking.check_out)}`
  }

  const isUpcoming = () => {
    return new Date(booking.check_out) >= new Date() && booking.status === 'confirmed'
  }

  const isCancellable = () => {
    const checkInDate = new Date(booking.check_in)
    const today = new Date()
    const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysDifference >= 1 && booking.status === 'confirmed' // Can cancel up to 1 day before
  }

  const handleCancelBooking = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id)

      if (error) {
        throw error
      }

      setShowCancelModal(false)
      onUpdate()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const propertyImage = booking.property.property_images?.find(img => img.display_order === 1) || booking.property.property_images?.[0]

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className={isMobile ? 'p-4' : 'p-6'}>
          <div className={isMobile ? 'space-y-3' : 'flex space-x-4'}>
            {/* Property Image */}
            <Link 
              href={`/properties/${booking.property.id}`}
              className={`block rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hover:opacity-75 transition-opacity ${
                isMobile ? 'w-full aspect-video' : 'w-20 h-20'
              }`}
            >
              {propertyImage ? (
                <img
                  src={propertyImage.url}
                  alt={booking.property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className={`text-gray-300 ${isMobile ? 'w-12 h-12' : 'w-8 h-8'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
            </Link>

            {/* Booking Details */}
            <div className="flex-1 min-w-0">
              <div className={isMobile ? 'space-y-3' : 'flex items-start justify-between'}>
                <div className="flex-1">
                  <Link 
                    href={`/properties/${booking.property.id}`}
                    className="block hover:text-[#FF385C] transition-colors"
                  >
                    <h3 className={`font-semibold text-gray-900 line-clamp-1 ${isMobile ? 'text-lg' : ''}`}>
                      {booking.property.title}
                    </h3>
                  </Link>
                  <p className={`text-gray-600 ${isMobile ? 'text-base mt-1' : 'text-sm'}`}>
                    {booking.property.city}, {booking.property.country}
                  </p>
                  
                  <div className={`flex items-center text-gray-600 ${isMobile ? 'mt-3 flex-col items-start space-y-1' : 'mt-2 space-x-4 text-sm'}`}>
                    <span className={isMobile ? 'text-base font-medium' : ''}>{formatDateRange()}</span>
                    {!isMobile && <span>•</span>}
                    <span className={isMobile ? 'text-sm' : ''}>{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className={`flex items-center ${isMobile ? 'mt-3 justify-between' : 'mt-2 space-x-3'}`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-sm'}`}>
                      ${booking.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className={isMobile ? 'flex space-x-3 mt-4' : 'flex flex-col space-y-2 ml-4'}>
                  {isUpcoming() && (
                    <>
                      <Link
                        href={`/properties/${booking.property.id}`}
                        className={isMobile ? 'btn-primary flex-1' : 'text-sm text-[#FF385C] hover:text-[#E31C5F] font-medium'}
                      >
                        View Property
                      </Link>
                      
                      {isCancellable() && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className={isMobile ? 'btn-secondary flex-1' : 'text-sm text-gray-600 hover:text-gray-900 font-medium'}
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                  
                  {booking.status === 'completed' && (
                    <button className={`text-[#FF385C] hover:text-[#E31C5F] font-medium ${isMobile ? 'btn-primary w-full' : 'text-sm'}`}>
                      Leave Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel booking</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your booking for {booking.property.title}? 
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 btn-secondary"
                disabled={isLoading}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </div>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  address: string
  city: string
  country: string
  property_images?: { url: string; display_order: number }[]
  profiles?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

interface BookingData {
  id: string
  check_in: string
  check_out: string
  guest_count: number
  total_price: number
  status: string
  created_at: string
  property: Property
}

interface BookingConfirmationProps {
  booking: BookingData
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = () => {
    const checkIn = formatDate(booking.check_in)
    const checkOut = formatDate(booking.check_out)
    return `${checkIn} - ${checkOut}`
  }

  const calculateNights = () => {
    const start = new Date(booking.check_in)
    const end = new Date(booking.check_out)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const propertyImage = booking.property.property_images?.find(img => img.display_order === 1) || booking.property.property_images?.[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking confirmed!</h1>
            <p className="text-gray-600">
              Your reservation has been confirmed. Check your email for booking details.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Booking Details */}
          <div className={isMobile ? 'order-1' : 'order-1 col-span-2'}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Property Image & Basic Info */}
              <div className="flex p-6 border-b border-gray-200">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {propertyImage ? (
                    <img
                      src={propertyImage.url}
                      alt={booking.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{booking.property.title}</h2>
                  <p className="text-gray-600 text-sm">{booking.property.city}, {booking.property.country}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Your trip</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Dates</p>
                      <p className="text-gray-600">{formatDateRange()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Guests</p>
                      <p className="text-gray-600">{booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Getting there</h3>
                  <p className="text-gray-600">{booking.property.address}</p>
                  <p className="text-gray-600">{booking.property.city}, {booking.property.country}</p>
                </div>

                {/* Host Contact */}
                {booking.property.profiles && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Your host</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                        {booking.property.profiles.avatar_url ? (
                          <img
                            src={booking.property.profiles.avatar_url}
                            alt={booking.property.profiles.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {booking.property.profiles.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.property.profiles.full_name}</p>
                        <p className="text-sm text-gray-600">{booking.property.profiles.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Payment Summary */}
          <div className={isMobile ? 'order-2' : 'order-2'}>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Total paid</span>
                  <span className="font-semibold text-gray-900">${booking.total_price}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="bg-[#FF385C] bg-opacity-5 border border-[#FF385C] border-opacity-20 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-[#FF385C] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[#FF385C] mb-1">Payment on arrival</p>
                      <p className="text-xs text-gray-600">
                        You'll pay the host directly when you check in. No upfront payment required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/dashboard/guest"
                  className="block w-full btn-primary text-center"
                >
                  View My Bookings
                </Link>
                
                <Link
                  href="/properties"
                  className="block w-full btn-secondary text-center"
                >
                  Browse More Properties
                </Link>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What's next?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Confirmation email sent</p>
                    <p className="text-xs text-gray-600">Check your inbox for booking details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#FF385C] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#FF385C] text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contact your host</p>
                    <p className="text-xs text-gray-600">Coordinate check-in details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-yellow-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Prepare for your trip</p>
                    <p className="text-xs text-gray-600">Pack and plan your stay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
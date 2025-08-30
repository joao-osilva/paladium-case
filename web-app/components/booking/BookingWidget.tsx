'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MobileDatePicker } from '@/components/ui/MobileDatePicker'

interface Property {
  id: string
  title: string
  price_per_night: number
  max_guests: number
}

interface Booking {
  check_in: string
  check_out: string
  status: string
}

interface BookingWidgetProps {
  property: Property
  bookings: Booking[]
  searchParams: {
    checkin?: string
    checkout?: string
    guests?: string
  }
}

export function BookingWidget({ property, bookings, searchParams }: BookingWidgetProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState(searchParams.checkin || '')
  const [checkOut, setCheckOut] = useState(searchParams.checkout || '')
  const [guests, setGuests] = useState(parseInt(searchParams.guests || '1'))
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    checkAuth()
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (checkIn && checkOut) {
      checkAvailability()
    }
  }, [checkIn, checkOut])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const checkAvailability = () => {
    if (!checkIn || !checkOut) return

    const requestedCheckIn = new Date(checkIn)
    const requestedCheckOut = new Date(checkOut)

    // Check if dates are valid
    if (requestedCheckIn >= requestedCheckOut) {
      setIsAvailable(false)
      setError('Check-out date must be after check-in date')
      return
    }

    if (requestedCheckIn < new Date()) {
      setIsAvailable(false)
      setError('Check-in date cannot be in the past')
      return
    }

    // Check against existing bookings
    const hasConflict = bookings.some(booking => {
      const bookingCheckIn = new Date(booking.check_in)
      const bookingCheckOut = new Date(booking.check_out)

      return (
        booking.status === 'confirmed' && (
          (requestedCheckIn >= bookingCheckIn && requestedCheckIn < bookingCheckOut) ||
          (requestedCheckOut > bookingCheckIn && requestedCheckOut <= bookingCheckOut) ||
          (requestedCheckIn <= bookingCheckIn && requestedCheckOut >= bookingCheckOut)
        )
      )
    })

    setIsAvailable(!hasConflict)
    setError(hasConflict ? 'Property is not available for selected dates' : '')
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    const subtotal = nights * property.price_per_night
    const serviceFee = Math.round(subtotal * 0.1) // 10% service fee
    const cleaningFee = 50 // Fixed cleaning fee
    return {
      nights,
      subtotal,
      serviceFee,
      cleaningFee,
      total: subtotal + serviceFee + cleaningFee
    }
  }

  const handleBooking = async () => {
    if (!user) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/properties/${property.id}?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`)
      router.push(`/auth/login?redirect=${returnUrl}`)
      return
    }

    if (!isAvailable || !checkIn || !checkOut) return

    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { total } = calculateTotal()

      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            property_id: property.id,
            guest_id: user.id,
            check_in: checkIn,
            check_out: checkOut,
            guest_count: guests,
            total_price: total,
            status: 'confirmed'
          }
        ])
        .select()

      if (error) {
        throw error
      }

      // Redirect to booking confirmation
      router.push(`/booking/confirm/${data[0].id}`)
    } catch (error: any) {
      console.error('Booking error:', error)
      if (error.message?.includes('overlapping')) {
        setError('Property is no longer available for these dates. Please select different dates.')
      } else {
        setError('Failed to create booking. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const pricing = calculateTotal()

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline">
          <span className="text-2xl font-semibold text-gray-900">
            ${property.price_per_night}
          </span>
          <span className="text-gray-600 ml-1">night</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="border border-gray-300 rounded-lg mb-4">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <div className={`${isMobile ? 'border-b border-gray-300 p-4' : 'border-r border-gray-300 p-4'}`}>
            <MobileDatePicker
              value={checkIn}
              onChange={setCheckIn}
              label="CHECK-IN"
              minDate={new Date()}
              placeholder="Select check-in date"
            />
          </div>
          <div className="p-4">
            <MobileDatePicker
              value={checkOut}
              onChange={setCheckOut}
              label="CHECKOUT"
              minDate={checkIn ? new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
              placeholder="Select checkout date"
            />
          </div>
        </div>
        
        <div className="border-t border-gray-300 p-4">
          <label className="block text-xs font-semibold text-gray-900 mb-2">
            GUESTS
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className={`w-full text-gray-900 border-none outline-none bg-transparent focus:outline-none cursor-pointer ${isMobile ? 'text-lg min-h-[48px] py-2' : 'text-base md:text-sm min-h-[44px] p-1 -m-1'}`}
          >
            {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {num} guest{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Availability Status */}
      {checkIn && checkOut && !error && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available for your dates
          </p>
        </div>
      )}

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={!checkIn || !checkOut || !isAvailable || isLoading}
        className="w-full btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : user ? (
          'Reserve'
        ) : (
          'Sign in to book'
        )}
      </button>

      {/* Price Breakdown */}
      {checkIn && checkOut && pricing.nights > 0 && (
        <>
          <p className="text-center text-sm text-gray-600 mb-4">
            You won't be charged yet
          </p>
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                ${property.price_per_night} x {pricing.nights} nights
              </span>
              <span className="text-gray-900">${pricing.subtotal}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Service fee</span>
              <span className="text-gray-900">${pricing.serviceFee}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Cleaning fee</span>
              <span className="text-gray-900">${pricing.cleaningFee}</span>
            </div>
            
            <div className="flex justify-between font-semibold pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>${pricing.total}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
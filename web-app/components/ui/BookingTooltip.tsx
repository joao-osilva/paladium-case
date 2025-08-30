'use client'

import { useState, useEffect } from 'react'
import type { BookingWithGuest } from '@/types/booking'

interface BookingTooltipProps {
  booking: BookingWithGuest
  children: React.ReactNode
}

export function BookingTooltip({ booking, children }: BookingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
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
    const checkIn = formatDate(booking.check_in)
    const checkOut = formatDate(booking.check_out)
    return `${checkIn} - ${checkOut}`
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${isMobile ? 'w-56' : 'w-64'}`}>
          <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            {/* Guest Info */}
            <div className={`flex items-center space-x-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <div className={`rounded-full overflow-hidden bg-[#717171] flex-shrink-0 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                {booking.guest.avatar_url ? (
                  <img
                    src={booking.guest.avatar_url}
                    alt={booking.guest.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className={`text-white font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {booking.guest.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-[#222222] truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {booking.guest.full_name}
                </p>
                <p className="text-xs text-[#717171] truncate">
                  {isMobile ? booking.guest.email.split('@')[0] : booking.guest.email}
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className={`space-y-2 ${isMobile ? 'space-y-1.5' : 'space-y-2'}`}>
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <svg className={`text-[#717171] mr-2 flex-shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[#717171]">
                  {isMobile ? `${new Date(booking.check_in).getDate()}/${new Date(booking.check_in).getMonth() + 1} - ${new Date(booking.check_out).getDate()}/${new Date(booking.check_out).getMonth() + 1}` : formatDateRange()}
                </span>
              </div>
              
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <svg className={`text-[#717171] mr-2 flex-shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[#717171]">
                  {booking.guest_count} {booking.guest_count > 1 ? 'guests' : 'guest'}
                </span>
              </div>
              
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <svg className={`text-[#717171] mr-2 flex-shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-[#717171]">
                  ${booking.total_price.toLocaleString()}
                </span>
              </div>

              {/* Status Badge */}
              <div className={`${isMobile ? 'pt-1.5' : 'pt-2'}`}>
                <span className={`
                  inline-flex items-center rounded-full font-medium
                  ${isMobile ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}
                  ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'}
                `}>
                  {isMobile && booking.status === 'confirmed' ? 'Confirmed' : 
                   isMobile && booking.status === 'cancelled' ? 'Cancelled' :
                   booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
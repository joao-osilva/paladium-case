'use client'

import { useState, useEffect } from 'react'
import { BookingTooltip } from '@/components/ui/BookingTooltip'
import type { CalendarDay, CalendarMonth, BookingWithGuest } from '@/types/booking'

interface PropertyAvailabilityCalendarProps {
  propertyId: string
  bookings: BookingWithGuest[]
  className?: string
}

export function PropertyAvailabilityCalendar({ 
  propertyId, 
  bookings, 
  className = '' 
}: PropertyAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarMonth | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate calendar data
  useEffect(() => {
    const generateCalendar = () => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      const firstDayOfMonth = new Date(year, month, 1)
      const lastDayOfMonth = new Date(year, month + 1, 0)
      const firstDayOfWeek = firstDayOfMonth.getDay()
      
      const days: CalendarDay[] = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Add previous month's days
      const prevMonth = new Date(year, month - 1, 0)
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonth.getDate() - i)
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          isAvailable: true,
          booking: undefined
        })
      }

      // Add current month's days
      for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const date = new Date(year, month, day)
        const dateStr = date.toISOString().split('T')[0]
        
        // Find booking for this date
        const booking = bookings.find(b => {
          const checkIn = new Date(b.check_in)
          const checkOut = new Date(b.check_out)
          return date >= checkIn && date < checkOut && b.status === 'confirmed'
        })

        days.push({
          date,
          isCurrentMonth: true,
          isToday: date.getTime() === today.getTime(),
          isAvailable: !booking,
          booking
        })
      }

      // Add next month's days to fill the grid
      const remainingDays = 42 - days.length // 6 weeks × 7 days
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day)
        days.push({
          date,
          isCurrentMonth: false,
          isToday: false,
          isAvailable: true,
          booking: undefined
        })
      }

      setCalendarData({
        year,
        month,
        days
      })
    }

    generateCalendar()
  }, [currentDate, bookings])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!calendarData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Calendar Header */}
      <div className={`flex items-center justify-between border-b border-gray-200 ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`font-semibold text-[#222222] ${isMobile ? 'text-base' : 'text-lg'}`}>
          {formatMonthYear(currentDate)}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Body */}
      <div className={isMobile ? 'p-3' : 'p-4'}>
        {/* Week Day Headers */}
        <div className={`grid grid-cols-7 ${isMobile ? 'gap-0.5 text-xs' : 'gap-1 text-sm'} mb-2`}>
          {weekDays.map(day => (
            <div key={day} className={`text-center font-medium text-[#717171] ${isMobile ? 'py-1' : 'py-2'}`}>
              {isMobile ? day.slice(0, 1) : day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={`grid grid-cols-7 ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
          {calendarData.days.map((day, index) => {
            const dayContent = (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center transition-colors relative
                  ${!day.isCurrentMonth 
                    ? 'text-gray-300 cursor-default' 
                    : day.isToday
                      ? 'bg-[#FF385C] text-white font-semibold cursor-default'
                      : day.isAvailable
                        ? 'text-[#222222] hover:bg-green-50 border border-green-200 cursor-default'
                        : 'bg-red-100 text-red-800 hover:bg-red-150 cursor-pointer'
                  }
                  ${isMobile ? 'text-xs min-h-[30px] rounded-sm' : 'text-sm min-h-[48px] rounded-lg'}
                `}
              >
                {day.date.getDate()}
                
                {/* Booking indicator dot */}
                {day.booking && (
                  <div className={`absolute bg-red-500 rounded-full ${isMobile ? 'top-0.5 right-0.5 w-1.5 h-1.5' : 'top-1 right-1 w-2 h-2'}`}></div>
                )}
              </div>
            )

            // Wrap with tooltip if there's a booking
            if (day.booking && day.isCurrentMonth) {
              return (
                <BookingTooltip key={index} booking={day.booking}>
                  {dayContent}
                </BookingTooltip>
              )
            }

            return dayContent
          })}
        </div>

        {/* Legend */}
        <div className={`mt-4 pt-3 border-t border-gray-200 ${isMobile ? 'px-1' : ''}`}>
          <div className={`flex items-center justify-center ${isMobile ? 'space-x-2 text-xs' : 'space-x-6 text-sm'}`}>
            <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
              <div className={`bg-green-100 border border-green-200 rounded ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
              <span className="text-[#717171]">Available</span>
            </div>
            <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
              <div className={`bg-red-100 rounded ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
              <span className="text-[#717171]">Booked</span>
            </div>
            <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
              <div className={`bg-[#FF385C] rounded ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}></div>
              <span className="text-[#717171]">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
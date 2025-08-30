'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface MobileDatePickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  minDate?: Date
  placeholder?: string
  className?: string
}

export function MobileDatePicker({ 
  value, 
  onChange, 
  label, 
  minDate, 
  placeholder,
  className = ''
}: MobileDatePickerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const selectedDate = value ? new Date(value) : null

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      onChange(formattedDate)
    }
    setIsOpen(false)
  }

  // On desktop, use native HTML5 date input for better performance
  if (!isMobile) {
    return (
      <div className="w-full">
        <label className="block text-xs font-semibold text-gray-900 mb-2">
          {label}
        </label>
        <input
          type="date"
          value={value}
          min={minDate?.toISOString().split('T')[0]}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full text-base md:text-sm text-gray-900 border-none outline-none bg-transparent focus:outline-none min-h-[44px] cursor-pointer ${className}`}
        />
      </div>
    )
  }

  // On mobile, use custom DatePicker with modal
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-gray-900 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? selectedDate.toLocaleDateString() : ''}
          placeholder={placeholder || 'Select date'}
          onClick={() => setIsOpen(true)}
          readOnly
          className={`w-full text-lg text-gray-900 border-none outline-none bg-transparent focus:outline-none min-h-[48px] py-2 cursor-pointer ${className}`}
        />
        
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 m-4 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={minDate}
                inline
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="w-full"
                calendarClassName="mobile-datepicker-calendar"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .mobile-datepicker-calendar {
          width: 100% !important;
          font-size: 16px !important;
        }
        
        .mobile-datepicker-calendar .react-datepicker__day {
          width: 2.5rem !important;
          height: 2.5rem !important;
          line-height: 2.5rem !important;
          margin: 0.1rem !important;
        }
        
        .mobile-datepicker-calendar .react-datepicker__day:hover {
          background-color: #FF385C !important;
          color: white !important;
        }
        
        .mobile-datepicker-calendar .react-datepicker__day--selected {
          background-color: #FF385C !important;
          color: white !important;
        }
        
        .mobile-datepicker-calendar .react-datepicker__header {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #e9ecef !important;
        }
        
        .mobile-datepicker-calendar .react-datepicker__current-month {
          font-weight: 600 !important;
          font-size: 1.1rem !important;
        }
        
        .mobile-datepicker-calendar .react-datepicker__day-name {
          font-weight: 600 !important;
          color: #6b7280 !important;
        }
      `}</style>
    </div>
  )
}
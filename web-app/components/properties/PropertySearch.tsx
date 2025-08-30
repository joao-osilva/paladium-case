'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SearchParams {
  location?: string
  checkin?: string
  checkout?: string
  guests?: string
}

interface PropertySearchProps {
  searchParams: SearchParams
}

export function PropertySearch({ searchParams }: PropertySearchProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  
  const [filters, setFilters] = useState({
    location: searchParams.location || '',
    checkin: searchParams.checkin || '',
    checkout: searchParams.checkout || '',
    guests: searchParams.guests || '1'
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value.trim())
      }
    })
    
    const queryString = params.toString()
    router.push(`/properties${queryString ? `?${queryString}` : ''}`)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Search Bar */}
        <div className={`bg-white border border-gray-300 ${isMobile ? 'rounded-lg p-3' : 'rounded-full p-2 shadow-sm'}`}>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-4 gap-0'} items-center`}>
            {/* Location */}
            <div className={`${isMobile ? 'border-b border-gray-200 pb-3' : 'border-r border-gray-200'} px-4 py-3`}>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Where
              </label>
              <input
                type="text"
                placeholder="Search destinations"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full text-sm text-gray-900 placeholder-gray-500 border-none outline-none bg-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Check-in */}
            <div className={`${isMobile ? 'border-b border-gray-200 pb-3' : 'border-r border-gray-200'} px-4 py-3`}>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Check in
              </label>
              <input
                type="date"
                value={filters.checkin}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFilters(prev => ({ ...prev, checkin: e.target.value }))}
                className="w-full text-sm text-gray-900 border-none outline-none bg-transparent"
              />
            </div>

            {/* Check-out */}
            <div className={`${isMobile ? 'border-b border-gray-200 pb-3' : 'border-r border-gray-200'} px-4 py-3`}>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Check out
              </label>
              <input
                type="date"
                value={filters.checkout}
                min={filters.checkin || getTomorrowDate()}
                onChange={(e) => setFilters(prev => ({ ...prev, checkout: e.target.value }))}
                className="w-full text-sm text-gray-900 border-none outline-none bg-transparent"
              />
            </div>

            {/* Guests & Search */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Who
                </label>
                <select
                  value={filters.guests}
                  onChange={(e) => setFilters(prev => ({ ...prev, guests: e.target.value }))}
                  className="text-sm text-gray-900 border-none outline-none bg-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num.toString()}>
                      {num} guest{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleSearch}
                className="ml-2 bg-[#FF385C] text-white p-3 rounded-full hover:bg-[#E31C5F] transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
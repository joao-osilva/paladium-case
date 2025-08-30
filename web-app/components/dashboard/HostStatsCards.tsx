'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StatsData {
  totalProperties: number
  activeBookings: number
  monthlyRevenue: number
  occupancyRate: number
}

interface HostStatsCardsProps {
  userId: string
  properties: any[]
}

export function HostStatsCards({ userId, properties }: HostStatsCardsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      if (properties.length === 0) {
        setStats({
          totalProperties: 0,
          activeBookings: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        })
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const propertyIds = properties.map(p => p.id)
        const currentMonth = new Date()
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        // Fetch current month's bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('total_price, status, check_in, check_out')
          .in('property_id', propertyIds)
          .gte('check_in', startOfMonth.toISOString().split('T')[0])
          .lte('check_out', endOfMonth.toISOString().split('T')[0])
          .in('status', ['confirmed', 'completed'])

        // Fetch active bookings (current and future)
        const today = new Date().toISOString().split('T')[0]
        const { data: activeBookingsData } = await supabase
          .from('bookings')
          .select('id')
          .in('property_id', propertyIds)
          .gte('check_out', today)
          .eq('status', 'confirmed')

        const totalProperties = properties.length
        const activeBookings = activeBookingsData?.length || 0
        const monthlyRevenue = bookingsData?.reduce((sum, booking) => sum + parseFloat(booking.total_price.toString()), 0) || 0

        // Calculate occupancy rate (simplified)
        const totalBookedDays = bookingsData?.reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in)
          const checkOut = new Date(booking.check_out)
          const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) || 0
        
        const daysInMonth = endOfMonth.getDate()
        const totalPossibleDays = totalProperties * daysInMonth
        const occupancyRate = totalPossibleDays > 0 ? Math.round((totalBookedDays / totalPossibleDays) * 100) : 0

        setStats({
          totalProperties,
          activeBookings,
          monthlyRevenue,
          occupancyRate
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats({
          totalProperties: properties.length,
          activeBookings: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, properties])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'text-[#FF385C]',
      bgColor: 'bg-red-50',
      loading: false
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      loading: loading
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'text-[#FF385C]',
      bgColor: 'bg-red-50',
      loading: loading
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-[#FF385C]',
      bgColor: 'bg-red-50',
      loading: loading
    }
  ]

  return (
    <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium text-gray-600 ${isMobile ? 'text-xs' : ''}`}>
                {isMobile && card.title === 'Monthly Revenue' ? 'Revenue' : 
                 isMobile && card.title === 'Occupancy Rate' ? 'Occupancy' :
                 card.title}
              </p>
              {card.loading ? (
                <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {card.value}
                </p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${card.bgColor} ${card.color} flex-shrink-0`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
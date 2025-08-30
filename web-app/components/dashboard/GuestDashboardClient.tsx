'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookingCard } from './BookingCard'
import Link from 'next/link'

interface GuestStats {
  activeBookings: number
  completedStays: number
  totalSpent: number
}

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

interface GuestDashboardClientProps {
  userId: string
}

export function GuestDashboardClient({ userId }: GuestDashboardClientProps) {
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [stats, setStats] = useState<GuestStats>({ activeBookings: 0, completedStays: 0, totalSpent: 0 })
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
    fetchBookings()
  }, [userId])

  const fetchBookings = async () => {
    try {
      const supabase = createClient()
      
      // Fetch user's bookings with property details
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          check_in,
          check_out,
          guest_count,
          total_price,
          status,
          created_at,
          property:properties (
            id,
            title,
            city,
            country,
            property_images (
              url,
              display_order
            ),
            profiles:host_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('guest_id', userId)
        .order('check_in', { ascending: false })

      if (error) {
        console.error('Error fetching bookings:', error)
        return
      }

      const transformedBookings = bookingsData?.map(booking => ({
        ...booking,
        property: booking.property as any
      })) || []

      setBookings(transformedBookings)

      // Calculate stats
      const now = new Date()
      const activeCount = transformedBookings.filter(b => 
        new Date(b.check_out) >= now && b.status === 'confirmed'
      ).length
      
      const completedCount = transformedBookings.filter(b => 
        b.status === 'completed'
      ).length

      const totalSpent = transformedBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.total_price.toString()), 0)

      setStats({
        activeBookings: activeCount,
        completedStays: completedCount,
        totalSpent
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingBookings = bookings.filter(b => 
    new Date(b.check_out) >= new Date() && b.status === 'confirmed'
  )

  const pastBookings = bookings.filter(b => 
    new Date(b.check_out) < new Date() || b.status === 'completed'
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Your trips</h1>
          <p className="text-gray-600">Manage your bookings and discover new places</p>
        </div>
        <Link href="/properties" className="mt-4 sm:mt-0 btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Explore Properties
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              {loading ? (
                <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse w-12"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{stats.activeBookings}</p>
              )}
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <svg className="w-6 h-6 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Stays</p>
              {loading ? (
                <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse w-12"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{stats.completedStays}</p>
              )}
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                {loading ? (
                  <div className="mt-1 h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">
                    ${stats.totalSpent.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* Upcoming Bookings Skeleton */}
          <div>
            <div className="skeleton-title w-32 mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex space-x-4">
                    <div className="skeleton w-20 h-20 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-title w-3/4"></div>
                      <div className="skeleton-text w-1/2"></div>
                      <div className="skeleton-text w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming trips</h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onUpdate={fetchBookings} />
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {upcomingBookings.length > 0 ? 'Previous trips' : 'Your trips'}
              </h2>
              <div className="space-y-4">
                {pastBookings.slice(0, 5).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onUpdate={fetchBookings} />
                ))}
              </div>
              {pastBookings.length > 5 && (
                <button className="mt-4 text-sm text-[#FF385C] hover:text-[#E31C5F] font-medium">
                  View all {pastBookings.length} trips
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No trips yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                When you book your first trip, you'll see it here. Start exploring amazing places!
              </p>
              <Link href="/properties" className="btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Start Exploring
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
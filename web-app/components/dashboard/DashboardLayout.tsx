'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Profile } from '@/types/user'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleProfileNavigation = () => {
    const profilePath = user.user_type === 'host' ? '/dashboard/host/profile' : '/dashboard/guest/profile'
    console.log('Profile navigation clicked. User type:', user.user_type, 'Path:', profilePath)
    setShowDropdown(false)
    router.push(profilePath)
  }

  const dashboardPath = user.user_type === 'host' ? '/dashboard/host' : '/dashboard/guest'

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={dashboardPath} className="flex items-center">
              <svg viewBox="0 0 32 32" className="w-8 h-8 text-[#FF385C]" fill="currentColor">
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.666.06 2.932-.604 3.737-.357.435-.843.75-1.407.75a2.32 2.32 0 0 1-.928-.196l-.632-.318c-.065-.031-.126-.063-.192-.095l-.801-.407c-.65-.34-1.397-.729-2.166-1.155-.768-.426-1.559-.891-2.34-1.386-.781-.495-1.551-1.02-2.295-1.573a65.005 65.005 0 0 1-2.203-1.711l-.807-.662-.448-.386-.415.394-.688.655a65.457 65.457 0 0 1-2.105 1.673c-.744.552-1.513 1.076-2.295 1.571-.781.495-1.572.96-2.34 1.386-.543.302-1.077.587-1.594.853l-.572.302-.8.407c-.184.096-.361.193-.604.321l-.352.183a2.316 2.316 0 0 1-.928.196c-.564 0-1.05-.315-1.407-.75-.664-.805-1.271-2.071-.604-3.737l.145-.353c.986-2.297 5.147-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1z"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-[#FF385C]">paxbnb</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              {user.user_type === 'host' && (
                <button
                  onClick={() => router.push('/dashboard/host')}
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-[#222222] hover:bg-gray-100 rounded-full transition-colors"
                >
                  Your properties
                </button>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
                >
                  <svg className="w-5 h-5 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#717171] flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-[#222222]">{user.full_name}</p>
                        <p className="text-xs text-[#717171]">{user.email}</p>
                      </div>
                      <button
                        onClick={handleProfileNavigation}
                        className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-gray-50"
                      >
                        Profile
                      </button>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-[#222222] hover:bg-gray-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-[#717171]">
              © 2024 PaxBnb, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="/help" className="text-sm text-[#717171] hover:text-[#222222]">
                Help
              </a>
              <a href="/privacy" className="text-sm text-[#717171] hover:text-[#222222]">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-[#717171] hover:text-[#222222]">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
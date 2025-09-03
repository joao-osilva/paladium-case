'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'
import type { Profile } from '@/types/user'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: Profile
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={dashboardPath} className="hover:opacity-75 transition-colors">
              <Logo size={isMobile ? 'md' : 'lg'} asLink={false} />
            </Link>
            
            <div className="flex items-center space-x-2">
              {user.user_type === 'host' && !isMobile && (
                <button
                  onClick={() => router.push('/dashboard/host')}
                  className="btn-ghost"
                >
                  Dashboard
                </button>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 border border-gray-300 rounded-full hover:shadow-md transition-all duration-200 hover:border-gray-400"
                >
                  <svg className={`text-[#717171] ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className={`rounded-full overflow-hidden ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#717171] flex items-center justify-center">
                        <span className={`text-white font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {user.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                
                {showDropdown && (
                  <div className={`absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 ${isMobile ? 'w-48' : 'w-56'}`}>
                    <div className="py-2">
                      <div className={`px-4 py-3 border-b border-gray-200 ${isMobile ? 'px-3 py-2' : ''}`}>
                        <p className={`font-semibold text-[#222222] ${isMobile ? 'text-sm' : 'text-sm'}`}>{user.full_name}</p>
                        <p className={`text-[#717171] ${isMobile ? 'text-xs truncate' : 'text-xs'}`}>{user.email}</p>
                      </div>
                      
                      {/* Mobile-specific navigation */}
                      {isMobile && user.user_type === 'host' && (
                        <>
                          <button
                            onClick={() => {
                              setShowDropdown(false)
                              router.push('/dashboard/host')
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      
                      {/* Mobile dashboard for guests too */}
                      {isMobile && user.user_type === 'guest' && (
                        <>
                          <button
                            onClick={() => {
                              setShowDropdown(false)
                              router.push('/dashboard/guest')
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      
                      <button
                        onClick={handleProfileNavigation}
                        className={`w-full text-left text-sm text-[#222222] hover:bg-gray-50 flex items-center ${isMobile ? 'px-4 py-3' : 'px-4 py-2'}`}
                      >
                        <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className={`w-full text-left text-sm text-[#222222] hover:bg-gray-50 flex items-center ${isMobile ? 'px-4 py-3' : 'px-4 py-2'}`}
                        >
                          <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
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
              © 2025 PaxBnb, Inc. All rights reserved.
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
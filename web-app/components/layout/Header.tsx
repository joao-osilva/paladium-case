'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  userProfile?: {
    id?: string;
    full_name: string;
    email?: string;
    user_type: 'host' | 'guest';
    avatar_url?: string | null;
  } | null;
  showAIAssistant?: boolean;
  className?: string;
}

export function Header({ userProfile, showAIAssistant = true, className = '' }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const dashboardPath = userProfile?.user_type === 'host' ? '/dashboard/host' : '/dashboard/guest';

  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="hover:opacity-75 transition-colors">
            <Logo size={isMobile ? 'md' : 'lg'} asLink={false} />
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            {!isMobile && (
              <>
                <Link 
                  href="/properties" 
                  className="btn-ghost text-sm font-medium"
                >
                  Browse Properties
                </Link>
                
                {showAIAssistant && (
                  <Link 
                    href="/chat" 
                    className="btn-ghost text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    AI Assistant
                  </Link>
                )}
              </>
            )}

            {userProfile ? (
              // Logged in menu
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 border border-gray-300 rounded-full hover:shadow-md transition-all duration-200 hover:border-gray-400"
                >
                  <svg className={`text-[#717171] ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className={`rounded-full overflow-hidden ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
                    {userProfile.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#717171] flex items-center justify-center">
                        <span className={`text-white font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {userProfile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                
                {showDropdown && (
                  <div className={`absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 ${isMobile ? 'w-48' : 'w-56'}`}>
                    <div className="py-2">
                      <div className={`px-4 py-3 border-b border-gray-200 ${isMobile ? 'px-3 py-2' : ''}`}>
                        <p className={`font-semibold text-[#222222] ${isMobile ? 'text-sm' : 'text-sm'}`}>{userProfile.full_name}</p>
                        {userProfile.email && (
                          <p className={`text-[#717171] ${isMobile ? 'text-xs truncate' : 'text-xs'}`}>{userProfile.email}</p>
                        )}
                      </div>
                      
                      {/* Mobile navigation items */}
                      {isMobile && (
                        <>
                          <Link
                            href="/properties"
                            onClick={() => setShowDropdown(false)}
                            className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Browse Properties
                          </Link>
                          
                          {showAIAssistant && (
                            <Link
                              href="/chat"
                              onClick={() => setShowDropdown(false)}
                              className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              AI Assistant
                            </Link>
                          )}
                          
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      
                      <Link
                        href={dashboardPath}
                        onClick={() => setShowDropdown(false)}
                        className={`w-full text-left text-sm text-[#222222] hover:bg-gray-50 flex items-center ${isMobile ? 'px-4 py-3' : 'px-4 py-2'}`}
                      >
                        <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      
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
            ) : (
              // Not logged in
              <>
                {!isMobile ? (
                  // Desktop login/signup
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/auth/login" 
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Sign up
                    </Link>
                  </div>
                ) : (
                  // Mobile menu for non-logged in users
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center space-x-2 p-2 border border-gray-300 rounded-full hover:shadow-md transition-all duration-200 hover:border-gray-400"
                    >
                      <svg className="w-4 h-4 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <svg className="w-6 h-6 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                        <div className="py-2">
                          <Link
                            href="/auth/register"
                            onClick={() => setShowDropdown(false)}
                            className="w-full text-left px-4 py-3 text-sm font-semibold text-[#222222] hover:bg-gray-50 block"
                          >
                            Sign up
                          </Link>
                          <Link
                            href="/auth/login"
                            onClick={() => setShowDropdown(false)}
                            className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 block"
                          >
                            Sign in
                          </Link>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          <Link
                            href="/properties"
                            onClick={() => setShowDropdown(false)}
                            className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Browse Properties
                          </Link>
                          
                          {showAIAssistant && (
                            <Link
                              href="/chat"
                              onClick={() => setShowDropdown(false)}
                              className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-gray-50 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-3 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              AI Assistant
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
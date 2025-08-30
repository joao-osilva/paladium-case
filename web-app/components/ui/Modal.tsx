'use client'

import { useEffect, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  showCloseButton = true 
}: ModalProps) {
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      
      // Prevent background scrolling on iOS
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      document.body.style.position = 'static'
      document.body.style.width = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black transition-opacity duration-300 ease-out"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className={`
        flex min-h-full items-end justify-center
        md:items-center md:p-4
        ${isMobile ? 'p-0' : 'p-4'}
      `}>
        <div 
          className={`
            relative w-full transform transition-all duration-300 ease-out
            ${isMobile ? 
              'rounded-t-xl max-h-[90vh] animate-slide-up' : 
              `${sizeClasses[size]} rounded-xl shadow-xl animate-scale-up max-h-[95vh]`
            }
            bg-white
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`
            flex items-center justify-between border-b border-gray-200
            ${isMobile ? 'px-4 py-4 sticky top-0 bg-white z-10' : 'px-6 py-4'}
          `}>
            <h2 className={`
              font-semibold text-[#222222] 
              ${isMobile ? 'text-lg' : 'text-xl'}
            `}>
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  hover:bg-gray-100 rounded-full transition-colors
                  ${isMobile ? 'p-2' : 'p-2'}
                `}
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 text-[#717171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className={`
            overflow-y-auto
            ${isMobile ? 
              'max-h-[calc(90vh-80px)] overscroll-contain' : 
              'max-h-[calc(95vh-80px)]'
            }
          `}>
            {children}
          </div>
          
          {/* Mobile handle indicator */}
          {isMobile && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes scale-up {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
        
        /* Custom scrollbar for webkit browsers */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }

        /* Safe area insets for modern mobile devices */
        @supports (padding: max(0px)) {
          .${isMobile ? 'p-0' : ''} {
            padding-bottom: max(env(safe-area-inset-bottom), 0px);
          }
        }
      `}</style>
    </div>
  )
}
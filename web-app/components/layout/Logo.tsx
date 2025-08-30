import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  asLink?: boolean
  href?: string
}

export function Logo({ className = '', size = 'md', asLink = true, href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold'
  }

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const logoContent = (
    <>
      <svg 
        className={`${iconSizes[size]} text-[#FF385C]`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
      <span>PaxBnb</span>
    </>
  )

  if (!asLink) {
    return (
      <div className={`flex items-center space-x-3 ${sizeClasses[size]} text-[#FF385C] ${className}`}>
        {logoContent}
      </div>
    )
  }

  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-3 ${sizeClasses[size]} text-[#FF385C] hover:text-[#E31C5F] transition-colors ${className}`}
    >
      {logoContent}
    </Link>
  )
}
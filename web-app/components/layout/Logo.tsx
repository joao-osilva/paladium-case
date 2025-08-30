import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold'
  }

  return (
    <Link 
      href="/" 
      className={`${sizeClasses[size]} text-blue-600 hover:text-blue-700 transition-colors ${className}`}
    >
      PaxBnb
    </Link>
  )
}
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user (single call)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // Helper function to get user profile with error handling
  async function getUserProfile(userId: string) {
    try {
      // First, check if any profiles exist for this user
      const { data: profiles, error: queryError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
      
      if (queryError) {
        console.log('Profile query error:', queryError.message)
        return null
      }
      
      if (!profiles || profiles.length === 0) {
        console.log('No profile found for user:', userId)
        return null
      }
      
      if (profiles.length > 1) {
        console.log('Multiple profiles found for user:', userId, 'using first one')
      }
      
      const profile = profiles[0]
      console.log('Profile data retrieved:', { userId, userType: profile?.user_type, totalProfiles: profiles.length })
      return profile
    } catch (error) {
      console.log('Profile query exception:', error)
      return null
    }
  }

  // Redirect unauthenticated users from protected routes
  if (!user || userError) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return supabaseResponse
  }

  // Handle authenticated users
  const profile = await getUserProfile(user.id)
  
  // If no profile exists, we need to handle this case
  if (!profile) {
    console.log('No profile found for authenticated user:', user.id)
    // For now, default to guest and let the app handle profile creation
    // In production, you might want to redirect to a profile setup page
  }
  
  const userType = profile?.user_type || 'guest' // Default to guest if no profile
  console.log('Final user type determined:', userType)

  // Protect dashboard routes with role-based access
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const currentPath = request.nextUrl.pathname
    const expectedBasePath = userType === 'host' ? '/dashboard/host' : '/dashboard/guest'
    
    // Only redirect if user is on the wrong dashboard type (not allowing subpaths)
    if (userType === 'host' && currentPath.startsWith('/dashboard/guest')) {
      console.log('Redirecting guest path to host dashboard:', currentPath, 'to', expectedBasePath)
      return NextResponse.redirect(new URL(expectedBasePath, request.url))
    }
    if (userType === 'guest' && currentPath.startsWith('/dashboard/host')) {
      console.log('Redirecting host path to guest dashboard:', currentPath, 'to', expectedBasePath)
      return NextResponse.redirect(new URL(expectedBasePath, request.url))
    }
    
    // User is on correct dashboard type (including subpaths), allow access
    return supabaseResponse
  }

  // Redirect from auth pages to dashboard
  if (request.nextUrl.pathname.startsWith('/auth')) {
    const dashboardPath = userType === 'host' ? '/dashboard/host' : '/dashboard/guest'
    console.log('Redirecting authenticated user from auth page to:', dashboardPath)
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  // Redirect from root to dashboard
  if (request.nextUrl.pathname === '/') {
    const dashboardPath = userType === 'host' ? '/dashboard/host' : '/dashboard/guest'
    console.log('Redirecting from root to:', dashboardPath, 'for user type:', userType)
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
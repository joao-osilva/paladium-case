import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to their dashboard
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const dashboardPath = profile?.user_type === 'host' ? '/dashboard/host' : '/dashboard/guest'
    redirect(dashboardPath)
  }

  // If user is not authenticated, redirect to login
  redirect('/auth/login')
}

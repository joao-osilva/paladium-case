import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { GuestDashboardClient } from '@/components/dashboard/GuestDashboardClient'

export const metadata: Metadata = {
  title: 'Guest Dashboard | PaxBnb',
  description: 'Manage your bookings and discover new places'
}

export default async function GuestDashboard() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.user_type !== 'guest') {
    redirect('/dashboard/host')
  }

  return (
    <DashboardLayout user={profile}>
      <GuestDashboardClient userId={profile.id} />
    </DashboardLayout>
  )
}
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { HostDashboardClient } from '@/components/dashboard/HostDashboardClient'

export const metadata: Metadata = {
  title: 'Host Dashboard | PaxBnb',
  description: 'Manage your properties and bookings'
}

export default async function HostDashboard() {
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

  if (!profile || profile.user_type !== 'host') {
    redirect('/dashboard/guest')
  }

  // Try to fetch properties, but don't fail if tables don't exist yet
  let properties = []
  try {
    const { data: propertiesData } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          url,
          display_order
        )
      `)
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
    
    properties = propertiesData || []
  } catch (error) {
    console.log('Properties table not yet created:', error)
    properties = []
  }

  return (
    <DashboardLayout user={profile}>
      <HostDashboardClient 
        userId={user.id}
        initialProperties={properties}
      />
    </DashboardLayout>
  )
}
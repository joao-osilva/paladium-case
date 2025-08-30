import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ProfileClient } from '@/components/dashboard/ProfileClient'

export const metadata: Metadata = {
  title: 'Profile | PaxBnb',
  description: 'Manage your profile information'
}

export default async function GuestProfilePage() {
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

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <DashboardLayout user={profile}>
      <ProfileClient user={profile} />
    </DashboardLayout>
  )
}
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { NewPropertyForm } from '@/components/properties/NewPropertyForm'

export const metadata: Metadata = {
  title: 'Add New Property | PaxBnb',
  description: 'List your property on PaxBnb'
}

export default async function NewPropertyPage() {
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

  return (
    <DashboardLayout user={profile}>
      <NewPropertyForm userId={user.id} />
    </DashboardLayout>
  )
}
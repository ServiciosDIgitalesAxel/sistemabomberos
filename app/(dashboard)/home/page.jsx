import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  const supabase = createAdminClient()

  const { data: actividades } = await supabase
    .from('activity_types')
    .select('*')
    .eq('org_id', session.org_id)
    .eq('activo', true)
    .order('orden')

  const { data: userGuards } = await supabase
    .from('user_guards')
    .select('guard_id, guards(id, nombre)')
    .eq('user_id', session.id)

  return (
    <HomeClient
      session={session}
      actividades={actividades || []}
      guardias={userGuards?.map(ug => ug.guards).filter(Boolean) || []}
    />
  )
}
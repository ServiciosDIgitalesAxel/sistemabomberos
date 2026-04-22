import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ActividadesClient from './ActividadesClient'

export default async function ActividadesPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (!['admin', 'superadmin'].includes(session.rol)) redirect('/home')

  const supabase = createAdminClient()
  const { data: actividades } = await supabase
    .from('activity_types')
    .select('*')
    .eq('org_id', session.org_id)
    .order('orden')

  return <ActividadesClient actividades={actividades || []} session={session} />
}
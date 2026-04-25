import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import MisEstadisticasClient from './MisEstadisticasClient'

export default async function MisEstadisticasPage() {
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
    .select('id, nombre, icono, color, tipo_base')
    .eq('org_id', session.org_id)
    .eq('activo', true)
    .order('orden')

  return <MisEstadisticasClient session={session} actividades={actividades || []} />
}
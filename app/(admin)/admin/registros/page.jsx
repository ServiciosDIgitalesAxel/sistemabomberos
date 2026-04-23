import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import RegistrosClient from './RegistrosClient'

export default async function RegistrosPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (!['admin', 'superadmin', 'jefe'].includes(session.rol)) redirect('/home')

  const supabase = createAdminClient()
  const { data: actividades } = await supabase
    .from('activity_types')
    .select('id, nombre, icono, estados')
    .eq('org_id', session.org_id)
    .eq('activo', true)
    .order('orden')

  return <RegistrosClient session={session} actividades={actividades || []} />
}
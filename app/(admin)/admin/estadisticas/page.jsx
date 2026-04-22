import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import EstadisticasClient from './EstadisticasClient'

export default async function EstadisticasPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (!['admin', 'superadmin', 'jefe'].includes(session.rol)) redirect('/home')

  const supabase = createAdminClient()

  const [
    { data: actividades },
    { data: guardias },
    { data: usuarios }
  ] = await Promise.all([
    supabase
      .from('activity_types')
      .select('id, nombre, icono, color, tipo_base')
      .eq('org_id', session.org_id)
      .eq('activo', true)
      .order('orden'),
    supabase
      .from('guards')
      .select('id, nombre')
      .eq('org_id', session.org_id)
      .eq('activa', true),
    supabase
      .from('users')
      .select('id, nombre, jerarquia, rol')
      .eq('org_id', session.org_id)
      .eq('activo', true)
      .neq('rol', 'superadmin')
      .order('nombre')
  ])

  return (
    <EstadisticasClient
      session={session}
      actividades={actividades || []}
      guardias={guardias || []}
      usuarios={usuarios || []}
    />
  )
}
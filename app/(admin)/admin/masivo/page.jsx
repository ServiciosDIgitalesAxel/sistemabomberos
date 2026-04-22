import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import MasivoClient from './MasivoClient'

export default async function MasivoPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (!['admin', 'superadmin', 'jefe'].includes(session.rol)) redirect('/home')

  const supabase = createAdminClient()

  // Si es jefe, solo ve su guardia
  let usuariosQuery = supabase
    .from('users')
    .select('id, nombre, jerarquia, user_guards(guard_id, guards(id, nombre))')
    .eq('org_id', session.org_id)
    .eq('activo', true)
    .neq('rol', 'superadmin')
    .order('nombre')

  const [
    { data: usuarios },
    { data: actividades },
    { data: guardias }
  ] = await Promise.all([
    usuariosQuery,
    supabase
      .from('activity_types')
      .select('id, nombre, icono, tipo_base, estados, color')
      .eq('org_id', session.org_id)
      .eq('activo', true)
      .order('orden'),
    supabase
      .from('guards')
      .select('id, nombre')
      .eq('org_id', session.org_id)
      .eq('activa', true)
  ])

  return (
    <MasivoClient
      session={session}
      usuarios={usuarios || []}
      actividades={actividades || []}
      guardias={guardias || []}
    />
  )
}
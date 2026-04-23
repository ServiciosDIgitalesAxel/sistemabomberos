import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import SuperUsuariosClient from './SuperUsuariosClient'

export default async function SuperUsuariosPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (session.rol !== 'superadmin') redirect('/home')

  const supabase = createAdminClient()
  const { data: usuarios } = await supabase
    .from('users')
    .select('id, nombre, jerarquia, username, rol, activo, created_at, organizations(id, nombre, color_primario)')
    .neq('rol', 'superadmin')
    .order('nombre')

  const { data: cuarteles } = await supabase
    .from('organizations')
    .select('id, nombre')
    .order('nombre')

  return <SuperUsuariosClient usuarios={usuarios || []} cuarteles={cuarteles || []} session={session} />
}
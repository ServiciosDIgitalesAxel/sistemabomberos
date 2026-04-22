import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (!['admin', 'superadmin'].includes(session.rol)) redirect('/home')

  const supabase = createAdminClient()

  const [{ data: usuarios }, { data: guardias }] = await Promise.all([
    supabase
      .from('users')
      .select('id, nombre, jerarquia, username, rol, activo, user_guards(guard_id, guards(id, nombre))')
      .eq('org_id', session.org_id)
      .neq('rol', 'superadmin')
      .order('nombre'),
    supabase
      .from('guards')
      .select('id, nombre')
      .eq('org_id', session.org_id)
      .eq('activa', true)
  ])

  return (
    <UsuariosClient
      usuarios={usuarios || []}
      guardias={guardias || []}
      session={session}
    />
  )
}
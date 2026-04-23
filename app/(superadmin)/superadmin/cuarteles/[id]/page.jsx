import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import CuartelDetalleClient from './CuartelDetalleClient'

export default async function CuartelDetallePage({ params }) {
  const { id } = await params

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (session.rol !== 'superadmin') redirect('/home')

  const supabase = createAdminClient()

  const { data: cuartel } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (!cuartel) redirect('/superadmin/cuarteles')

  const { data: usuarios } = await supabase
    .from('users')
    .select('id, nombre, jerarquia, username, rol, activo')
    .eq('org_id', id)
    .neq('rol', 'superadmin')
    .order('nombre')

  const { data: guardias } = await supabase
    .from('guards')
    .select('*')
    .eq('org_id', id)
    .order('created_at')

  const { data: actividades } = await supabase
    .from('activity_types')
    .select('*')
    .eq('org_id', id)
    .order('orden')

  return (
    <CuartelDetalleClient
      cuartel={cuartel}
      usuarios={usuarios || []}
      guardias={guardias || []}
      actividades={actividades || []}
      session={session}
    />
  )
}
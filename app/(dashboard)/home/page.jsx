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
  const hoy = new Date().toISOString().split('T')[0]

  const [
    { data: actividades },
    { data: registrosHoy },
    { data: userGuards },
    { data: historial }
  ] = await Promise.all([
    supabase
      .from('activity_types')
      .select('id, nombre, icono, color, tipo_base, estados')
      .eq('org_id', session.org_id)
      .eq('activo', true)
      .order('orden'),
    supabase
      .from('attendance_records')
      .select('id, activity_type_id, estado, hora_ingreso')
      .eq('user_id', session.id)
      .eq('fecha', hoy),
    supabase
      .from('user_guards')
      .select('guard_id, guards(id, nombre)')
      .eq('user_id', session.id),
    supabase
      .from('attendance_records')
      .select(`
        id, estado, fecha, hora_ingreso,
        activity_types(id, nombre, icono, color)
      `)
      .eq('user_id', session.id)
      .order('fecha', { ascending: false })
      .order('hora_ingreso', { ascending: false })
      .limit(8)
  ])

  const registradosHoy = {}
  ;(registrosHoy || []).forEach(r => {
    registradosHoy[r.activity_type_id] = {
      estado: r.estado,
      hora:   r.hora_ingreso?.substring(0, 5)
    }
  })

  return (
    <HomeClient
      session={session}
      actividades={actividades || []}
      guardias={userGuards?.map(ug => ug.guards).filter(Boolean) || []}
      registradosHoy={registradosHoy}
      historial={historial || []}
    />
  )
}
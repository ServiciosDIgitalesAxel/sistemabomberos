import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AsistenciaClient from './AsistenciaClient'

export default async function AsistenciaPage({ params }) {
  const { tipo: actividadId } = await params

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  const supabase = createAdminClient()

  const { data: actividad } = await supabase
    .from('activity_types')
    .select('*')
    .eq('id', actividadId)
    .eq('org_id', session.org_id)
    .single()

  if (!actividad) redirect('/home')

  const { data: userGuards } = await supabase
    .from('user_guards')
    .select('guard_id, guards(id, nombre)')
    .eq('user_id', session.id)

  const hoy = new Date().toISOString().split('T')[0]

  // Para eventos: buscar si hay uno en curso
  let enCurso = null
  let registroHoy = null

  if (actividad.tipo_base === 'evento') {
    const { data: ec } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', session.id)
      .eq('activity_type_id', actividadId)
      .is('hora_egreso', null)
      .not('hora_ingreso', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    enCurso = ec || null
  } else {
    const { data: rh } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', session.id)
      .eq('activity_type_id', actividadId)
      .eq('fecha', hoy)
      .maybeSingle()

    registroHoy = rh || null
  }

  return (
    <AsistenciaClient
      session={session}
      actividad={actividad}
      guardias={userGuards?.map(ug => ug.guards).filter(Boolean) || []}
      registroHoy={registroHoy}
      enCurso={enCurso}
    />
  )
}
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) return null
  try {
    return JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { return null }
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin', 'jefe'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { registros, activity_type_id, guard_id, fecha } = await request.json()

  if (!registros?.length || !activity_type_id || !fecha) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verificar que la actividad pertenece al cuartel
  const { data: actividad } = await supabase
    .from('activity_types')
    .select('id')
    .eq('id', activity_type_id)
    .eq('org_id', session.org_id)
    .single()

  if (!actividad) {
    return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
  }

  // Verificar registros duplicados para esa fecha
  const userIds = registros.map(r => r.user_id)
  const { data: existentes } = await supabase
    .from('attendance_records')
    .select('user_id')
    .eq('org_id', session.org_id)
    .eq('activity_type_id', activity_type_id)
    .eq('fecha', fecha)
    .in('user_id', userIds)

  const yaRegistrados = new Set(existentes?.map(e => e.user_id) || [])

  const nuevos = registros.filter(r => !yaRegistrados.has(r.user_id))
  const duplicados = registros.length - nuevos.length

  if (nuevos.length === 0) {
    return NextResponse.json({
      success: true,
      registrados: 0,
      duplicados,
      message: `⚠️ Todos ya estaban registrados para esa fecha`
    })
  }

  const inserts = nuevos.map(r => ({
    org_id:           session.org_id,
    user_id:          r.user_id,
    activity_type_id,
    guard_id:         guard_id || null,
    estado:           r.estado,
    observaciones:    r.observaciones || '',
    fecha,
    hora_ingreso:     new Date().toTimeString().split(' ')[0],
    registrado_por:   session.id
  }))

  const { error } = await supabase
    .from('attendance_records')
    .insert(inserts)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    registrados: nuevos.length,
    duplicados,
    message: `✅ ${nuevos.length} registrado${nuevos.length !== 1 ? 's' : ''}${duplicados > 0 ? ` · ⚠️ ${duplicados} duplicado${duplicados !== 1 ? 's' : ''} omitido${duplicados !== 1 ? 's' : ''}` : ''}`
  })
}
// Notificar a los bomberos registrados
try {
  const { enviarNotificacion } = await import('@/lib/push')
  const { data: actividadInfo } = await supabase
    .from('activity_types')
    .select('nombre')
    .eq('id', activity_type_id)
    .single()

  await enviarNotificacion({
    orgId:   session.org_id,
    userIds: nuevos.map(r => r.user_id),
    titulo:  'Asistencia registrada',
    cuerpo:  `El ${actividadInfo?.nombre || 'actividad'} del ${fecha} fue registrado por el administrador.`,
    url:     '/home'
  })
} catch {}
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

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const actividadId = searchParams.get('actividadId')
  if (!actividadId) return NextResponse.json({ error: 'actividadId requerido' }, { status: 400 })

  const supabase = createAdminClient()
  const hoy = new Date().toISOString().split('T')[0]

  // Buscar evento en curso (ingreso sin egreso)
  const { data: enCurso } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', session.id)
    .eq('activity_type_id', actividadId)
    .is('hora_egreso', null)
    .not('hora_ingreso', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Buscar registro de hoy completo
  const { data: registroHoy } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', session.id)
    .eq('activity_type_id', actividadId)
    .eq('fecha', hoy)
    .not('hora_egreso', 'is', null)
    .maybeSingle()

  return NextResponse.json({
    enCurso:     enCurso || null,
    registroHoy: registroHoy || null
  })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const {
    activity_type_id,
    guard_id,
    estado,
    observaciones,
    fecha,
    hora_ingreso,
  } = await request.json()

  if (!activity_type_id || !estado) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    // Notificación de éxito al bombero
try {
  const { enviarNotificacion } = await import('@/lib/push')
  
  const totalRegistros = await supabase
    .from('attendance_records')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.id)

  const total = totalRegistros.count || 0
  
  let mensaje = `✅ ${actividad.nombre} · ${estado}`
  let titulo  = 'Asistencia registrada'

  // Mensajes especiales por hitos
  if (total === 50) {
    titulo  = '¡50 registros! 🎉'
    mensaje = '¡Felicitaciones por tu predisposición! Gracias por la confianza.'
  } else if (total === 100) {
    titulo  = '¡100 registros! 🏆'
    mensaje = '¡Increíble dedicación! Sos un ejemplo para el cuartel.'
  } else if (total === 10) {
    titulo  = '¡10 registros! 🌟'
    mensaje = 'Vas muy bien, seguí así.'
  }

  await enviarNotificacion({
    orgId:   session.org_id,
    userIds: [session.id],
    titulo,
    cuerpo:  mensaje,
    url:     '/home'
  })
} catch {}
  }

  const supabase = createAdminClient()

  const { data: actividad } = await supabase
    .from('activity_types')
    .select('id, tipo_base')
    .eq('id', activity_type_id)
    .eq('org_id', session.org_id)
    .single()

  if (!actividad) {
    return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      org_id:           session.org_id,
      user_id:          session.id,
      activity_type_id,
      guard_id:         guard_id || null,
      estado,
      observaciones:    observaciones || '',
      fecha:            fecha || new Date().toISOString().split('T')[0],
      hora_ingreso:     hora_ingreso || null,
      registrado_por:   session.id
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, registro: data })
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, hora_egreso, tiempo_total } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createAdminClient()

  // Verificar que el registro pertenece al usuario
  const { data: registro } = await supabase
    .from('attendance_records')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!registro || registro.user_id !== session.id) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
  }

  const { error } = await supabase
    .from('attendance_records')
    .update({
      hora_egreso,
      tiempo_total,
      estado: 'Presente'
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
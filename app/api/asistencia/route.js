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

// GET — actividades disponibles para el usuario
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: actividades } = await supabase
    .from('activity_types')
    .select('*')
    .eq('org_id', session.org_id)
    .eq('activo', true)
    .order('orden')

  // Guardias del usuario
  const { data: userGuards } = await supabase
    .from('user_guards')
    .select('guard_id, guards(id, nombre)')
    .eq('user_id', session.id)

  return NextResponse.json({
    actividades: actividades || [],
    guardias: userGuards?.map(ug => ug.guards).filter(Boolean) || []
  })
}

// POST — registrar asistencia
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
    hora_egreso,
    tiempo_total
  } = await request.json()

  if (!activity_type_id || !estado) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verificar que la actividad pertenece al cuartel
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
      hora_egreso:      hora_egreso || null,
      tiempo_total:     tiempo_total || null,
      registrado_por:   session.id
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, registro: data })
}
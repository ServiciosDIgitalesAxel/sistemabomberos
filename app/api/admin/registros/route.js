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
  if (!['admin', 'superadmin', 'jefe'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const desde       = searchParams.get('desde')
  const hasta       = searchParams.get('hasta')
  const actividadId = searchParams.get('actividadId')

  const supabase = createAdminClient()

  let q = supabase
    .from('attendance_records')
    .select(`
      id, estado, observaciones, fecha, hora_ingreso, hora_egreso, tiempo_total, created_at,
      user:users!attendance_records_user_id_fkey(id, nombre, jerarquia),
      activity_types(id, nombre, icono, tipo_base, estados),
      guards(id, nombre)
    `)
    .eq('org_id', session.org_id)
    .order('fecha', { ascending: false })
    .order('hora_ingreso', { ascending: false })

  if (desde)       q = q.gte('fecha', desde)
  if (hasta)       q = q.lte('fecha', hasta)
  if (actividadId) q = q.eq('activity_type_id', actividadId)

  const { data, error } = await q
  if (error) {
    console.error('Error registros:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ registros: data || [] })
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin', 'jefe'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id, estado, observaciones, fecha, hora_ingreso, hora_egreso } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createAdminClient()
  const updates = {}
  if (estado        !== undefined) updates.estado        = estado
  if (observaciones !== undefined) updates.observaciones = observaciones
  if (fecha         !== undefined) updates.fecha         = fecha
  if (hora_ingreso  !== undefined) updates.hora_ingreso  = hora_ingreso || null
  if (hora_egreso   !== undefined) updates.hora_egreso   = hora_egreso  || null

  const { error } = await supabase
    .from('attendance_records')
    .update(updates)
    .eq('id', id)
    .eq('org_id', session.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', id)
    .eq('org_id', session.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
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

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('activity_types')
    .select('*')
    .eq('org_id', session.org_id)
    .order('orden')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ actividades: data })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { nombre, icono, color, tipo_base, estados, orden } = await request.json()
  if (!nombre || !tipo_base) {
    return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('activity_types')
    .insert({
      hora_inicio: hora_inicio || null,
hora_fin:  hora_fin    || null,
dias_semana:  dias_semana || [0,1,2,3,4,5,6],
      org_id: session.org_id,
      nombre,
      icono: icono || '📋',
      color: color || '#1a3d7a',
      tipo_base,
      estados: estados || ['Presente', 'Ausente Justificado'],
      orden: orden || 0
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, actividad: data })
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id, nombre, icono, color, estados, activo, orden } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createAdminClient()
  const updates = {}
  if (hora_inicio !== undefined) updates.hora_inicio = hora_inicio || null
if (hora_fin    !== undefined) updates.hora_fin    = hora_fin    || null
if (dias_semana !== undefined) updates.dias_semana = dias_semana
  if (nombre)  updates.nombre  = nombre
  if (icono)   updates.icono   = icono
  if (color)   updates.color   = color
  if (estados) updates.estados = estados
  if (activo !== undefined) updates.activo = activo
  if (orden !== undefined)  updates.orden  = orden

  const { error } = await supabase
    .from('activity_types')
    .update(updates)
    .eq('id', id)
    .eq('org_id', session.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
// Si se configuró horario, notificar a los usuarios del cuartel
if (hora_inicio && hora_fin) {
  try {
    const { enviarNotificacion } = await import('@/lib/push')
    const { data: actInfo } = await supabase
      .from('activity_types')
      .select('nombre')
      .eq('id', id)
      .single()

    await enviarNotificacion({
      orgId:  session.org_id,
      titulo: '🔔 Registro habilitado',
      cuerpo: `Ya está disponible el registro de "${actInfo?.nombre}". Horario: ${hora_inicio.substring(0,5)} a ${hora_fin.substring(0,5)}.`,
      url:    '/home'
    })
  } catch {}
}
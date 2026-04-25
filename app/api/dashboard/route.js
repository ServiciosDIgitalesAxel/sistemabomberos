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
  const hoy = new Date().toISOString().split('T')[0]

  const [
    { data: actividades },
    { data: registrosHoy },
    { data: userGuards }
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
      .eq('user_id', session.id)
  ])

  // Mapear qué actividades ya registró hoy
  const registradosHoy = {}
  ;(registrosHoy || []).forEach(r => {
    registradosHoy[r.activity_type_id] = {
      estado:      r.estado,
      hora:        r.hora_ingreso?.substring(0, 5),
      registro_id: r.id
    }
  })

  return NextResponse.json({
    actividades:    actividades || [],
    registradosHoy,
    guardias:       userGuards?.map(ug => ug.guards).filter(Boolean) || []
  })
}
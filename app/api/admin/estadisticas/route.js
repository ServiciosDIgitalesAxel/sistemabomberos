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
  const desde       = searchParams.get('desde')
  const hasta       = searchParams.get('hasta')
  const guardiaId   = searchParams.get('guardiaId')
  const usuarioId   = searchParams.get('usuarioId')

  if (!actividadId || !desde || !hasta) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  // Bombero solo puede ver sus propios datos
  if (session.rol === 'bombero') {
    if (!usuarioId || usuarioId !== session.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }
  }

  // Jefe y admin pueden ver todo su cuartel
  // Superadmin puede ver todo
  const supabase = createAdminClient()

  let q = supabase
    .from('attendance_records')
    .select(`
      id, estado, observaciones, fecha, hora_ingreso, hora_egreso, tiempo_total,
      user:users!attendance_records_user_id_fkey(id, nombre, jerarquia),
      guards(id, nombre)
    `)
    .eq('org_id', session.org_id)
    .eq('activity_type_id', actividadId)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false })
    .order('hora_ingreso', { ascending: false })

  if (guardiaId) q = q.eq('guard_id', guardiaId)
  if (usuarioId) q = q.eq('user_id', usuarioId)

  const { data: records, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const registros = (records || []).map(r => ({
    id:            r.id,
    nombre:        r.user?.nombre,
    jerarquia:     r.user?.jerarquia,
    userId:        r.user?.id,
    estado:        r.estado,
    observaciones: r.observaciones,
    fecha:         r.fecha,
    hora_ingreso:  r.hora_ingreso,
    hora_egreso:   r.hora_egreso,
    tiempo_total:  r.tiempo_total,
    guardia:       r.guards?.nombre,
  }))

  const total      = registros.length
  const diasUnicos = new Set(registros.map(r => r.fecha)).size
  const porEstado  = {}
  registros.forEach(r => {
    porEstado[r.estado] = (porEstado[r.estado] || 0) + 1
  })

  const bomberoMap = {}
  registros.forEach(r => {
    if (!bomberoMap[r.userId]) {
      bomberoMap[r.userId] = {
        userId: r.userId, nombre: r.nombre, jerarquia: r.jerarquia,
        total: 0, presentes: 0, porEstado: {}
      }
    }
    const b = bomberoMap[r.userId]
    b.total++
    if (r.estado === 'Presente') b.presentes++
    b.porEstado[r.estado] = (b.porEstado[r.estado] || 0) + 1
  })

  const porBombero = Object.values(bomberoMap)
    .sort((a, b) => b.presentes - a.presentes)

  return NextResponse.json({
    resumen: { total, diasUnicos, porEstado },
    porBombero,
    registros,
  })
}
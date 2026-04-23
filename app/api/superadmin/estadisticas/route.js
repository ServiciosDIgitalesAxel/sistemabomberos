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
  if (!session || session.rol !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const supabase = createAdminClient()

  const [
    { data: orgs },
    { data: users },
    { data: records },
  ] = await Promise.all([
    supabase.from('organizations').select('id, nombre, activa, color_primario, logo_url'),
    supabase.from('users').select('id, org_id, rol, activo').neq('rol', 'superadmin'),
    supabase.from('attendance_records').select('id, org_id, fecha, estado').order('fecha', { ascending: false }).limit(1000),
  ])

  const statsOrgs = (orgs || []).map(org => {
    const orgUsers   = (users   || []).filter(u => u.org_id === org.id)
    const orgRecords = (records || []).filter(r => r.org_id === org.id)
    return {
      id:            org.id,
      nombre:        org.nombre,
      activa:        org.activa,
      color:         org.color_primario,
      logo:          org.logo_url,
      totalUsuarios: orgUsers.length,
      usuariosActivos: orgUsers.filter(u => u.activo).length,
      totalRegistros: orgRecords.length,
      ultimoRegistro: orgRecords[0]?.fecha || null,
    }
  })

  return NextResponse.json({
    totalCuarteles:  orgs?.length || 0,
    cuartelesActivos: orgs?.filter(o => o.activa).length || 0,
    totalUsuarios:   users?.length || 0,
    usuariosActivos: users?.filter(u => u.activo).length || 0,
    totalRegistros:  records?.length || 0,
    porOrg: statsOrgs,
  })
}
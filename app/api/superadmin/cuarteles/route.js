import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('bv_session')
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    if (session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Body recibido:', body)

    const { nombre, color, adminNombre, adminJerarquia, adminUsername, adminPassword } = body

    console.log('Campos:', { nombre, adminNombre, adminUsername, adminPassword: adminPassword ? '***' : 'VACÍO' })

    if (!nombre || !adminNombre || !adminUsername || !adminPassword) {
      return NextResponse.json({ 
        error: `Faltan campos: ${!nombre?'nombre ':''} ${!adminNombre?'adminNombre ':''} ${!adminUsername?'adminUsername ':''} ${!adminPassword?'adminPassword':''}` 
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ nombre, color_primario: color || '#b01e1e' })
      .select()
      .single()

    if (orgError) throw orgError

    const { data: hashData } = await supabase
      .rpc('hash_password', { password: adminPassword })

    const { error: userError } = await supabase
      .from('users')
      .insert({
        org_id: org.id,
        nombre: adminNombre,
        jerarquia: adminJerarquia || '',
        username: adminUsername.trim().toLowerCase(),
        password_hash: hashData,
        rol: 'admin'
      })

    if (userError) {
      await supabase.from('organizations').delete().eq('id', org.id)
      if (userError.code === '23505') {
        return NextResponse.json({ error: 'Ese nombre de usuario ya existe' }, { status: 400 })
      }
      throw userError
    }

    return NextResponse.json({ success: true, cuartel: org })

  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 })
  }
}
const { data: org, error: orgError } = await supabase
  .from('organizations')
  .insert({
    nombre,
    color_primario: color || '#b01e1e',
    logo_url: logoUrl || null
  })
  .select()
  .single()
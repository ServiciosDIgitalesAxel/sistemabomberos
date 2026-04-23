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

    const nombreCuartel    = body.nombre
    const colorCuartel     = body.color
    const logoCuartel      = body.logoUrl
    const nombreAdmin      = body.adminNombre
    const jerarquiaAdmin   = body.adminJerarquia
    const usernameAdmin    = body.adminUsername
    const passwordAdmin    = body.adminPassword

    if (!nombreCuartel || !nombreAdmin || !usernameAdmin || !passwordAdmin) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: orgCreada, error: orgError } = await supabase
      .from('organizations')
      .insert({
        nombre:         nombreCuartel,
        color_primario: colorCuartel || '#b01e1e',
        logo_url:       logoCuartel  || null
      })
      .select()
      .single()

    if (orgError) throw orgError

    const { data: passwordHash, error: hashError } = await supabase
      .rpc('hash_password', { password: passwordAdmin })

    if (hashError) throw hashError

    const { error: userError } = await supabase
      .from('users')
      .insert({
        org_id:        orgCreada.id,
        nombre:        nombreAdmin,
        jerarquia:     jerarquiaAdmin || '',
        username:      usernameAdmin.trim().toLowerCase(),
        password_hash: passwordHash,
        rol:           'admin'
      })

    if (userError) {
      await supabase.from('organizations').delete().eq('id', orgCreada.id)
      if (userError.code === '23505') {
        return NextResponse.json({ error: 'Ese nombre de usuario ya existe' }, { status: 400 })
      }
      throw userError
    }

    return NextResponse.json({ success: true, cuartel: orgCreada })

  } catch (err) {
    console.error('Error crear cuartel:', err)
    return NextResponse.json({ error: 'Error del servidor: ' + err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('bv_session')
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    if (session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ cuarteles: data })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
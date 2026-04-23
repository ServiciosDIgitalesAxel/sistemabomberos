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
  const { data, error } = await supabase
    .from('users')
    .select('id, nombre, jerarquia, username, rol, activo, created_at, organizations(id, nombre, color_primario)')
    .neq('rol', 'superadmin')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ usuarios: data })
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session || session.rol !== 'superadmin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id, activo, rol, password } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createAdminClient()
  const updates = {}
  if (activo !== undefined) updates.activo = activo
  if (rol)                  updates.rol    = rol

  if (password) {
    const { data: hash } = await supabase.rpc('hash_password', { password })
    updates.password_hash = hash
  }

  const { error } = await supabase.from('users').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
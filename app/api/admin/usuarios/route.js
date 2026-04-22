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

// GET — listar usuarios del cuartel
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select(`
      id, nombre, jerarquia, username, rol, activo, created_at,
      user_guards ( guard_id, guards ( id, nombre ) )
    `)
    .eq('org_id', session.org_id)
    .neq('rol', 'superadmin')
    .order('nombre')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ usuarios: data })
}

// POST — crear usuario
export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { nombre, jerarquia, username, password, rol, guardias } = await request.json()

  if (!nombre || !username || !password || !rol) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }
  if (password.length < 4) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: hashData } = await supabase
    .rpc('hash_password', { password })

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      org_id: session.org_id,
      nombre,
      jerarquia: jerarquia || '',
      username: username.trim().toLowerCase(),
      password_hash: hashData,
      rol
    })
    .select()
    .single()

  if (userError) {
    if (userError.code === '23505') {
      return NextResponse.json({ error: 'Ese nombre de usuario ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  // Asignar guardias si se enviaron
  if (guardias && guardias.length > 0) {
    const asignaciones = guardias.map(gid => ({ user_id: user.id, guard_id: gid }))
    await supabase.from('user_guards').insert(asignaciones)
  }

  return NextResponse.json({ success: true, usuario: user })
}

// PATCH — editar usuario
export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!['admin', 'superadmin'].includes(session.rol)) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id, nombre, jerarquia, username, password, rol, activo, guardias } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createAdminClient()

  // Verificar que el usuario pertenece al cuartel
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .eq('org_id', session.org_id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const updates = {}
  if (nombre)    updates.nombre    = nombre
  if (jerarquia !== undefined) updates.jerarquia = jerarquia
  if (username)  updates.username  = username.trim().toLowerCase()
  if (rol)       updates.rol       = rol
  if (activo !== undefined) updates.activo = activo

  if (password) {
    if (password.length < 4) {
      return NextResponse.json({ error: 'Contraseña muy corta' }, { status: 400 })
    }
    const { data: hashData } = await supabase.rpc('hash_password', { password })
    updates.password_hash = hashData
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Actualizar guardias
  if (guardias !== undefined) {
    await supabase.from('user_guards').delete().eq('user_id', id)
    if (guardias.length > 0) {
      const asignaciones = guardias.map(gid => ({ user_id: id, guard_id: gid }))
      await supabase.from('user_guards').insert(asignaciones)
    }
  }

  return NextResponse.json({ success: true })
}
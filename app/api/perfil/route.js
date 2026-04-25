import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createSessionCookie } from '@/lib/session'

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) return null
  try {
    return JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { return null }
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { passwordActual, passwordNuevo, nombre, jerarquia } = await request.json()
  const supabase = createAdminClient()

  // Cambio de contraseña
  if (passwordActual && passwordNuevo) {
    if (passwordNuevo.length < 4) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 })
    }

    // Verificar contraseña actual
    const { data: verificado } = await supabase
      .rpc('verify_login', {
        p_username: session.username || '',
        p_password: passwordActual
      })

    if (!verificado || verificado.length === 0) {
      // Intentar verificar por ID
      const { data: usuario } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', session.id)
        .single()

      if (!usuario) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }

      const { data: match } = await supabase
        .rpc('verify_password', {
          p_password: passwordActual,
          p_hash: usuario.password_hash
        })

      if (!match) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
      }
    }

    const { data: hash } = await supabase.rpc('hash_password', { password: passwordNuevo })
    await supabase.from('users').update({ password_hash: hash }).eq('id', session.id)
  }

  // Actualizar datos personales
  if (nombre || jerarquia !== undefined) {
    const updates = {}
    if (nombre)              updates.nombre    = nombre
    if (jerarquia !== undefined) updates.jerarquia = jerarquia

    const { error } = await supabase.from('users').update(updates).eq('id', session.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Actualizar sesión
    const newSession = {
      ...session,
      ...(nombre    && { nombre }),
      ...(jerarquia !== undefined && { jerarquia })
    }
    const cookie = createSessionCookie(newSession)
    const response = NextResponse.json({ success: true, message: '✅ Perfil actualizado' })
    response.cookies.set(cookie.name, cookie.value, cookie.options)
    return response
  }

  return NextResponse.json({ success: true, message: '✅ Contraseña actualizada' })
}
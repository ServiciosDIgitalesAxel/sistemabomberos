import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSessionCookie } from '@/lib/session'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc('verify_login', {
      p_username: username.trim().toLowerCase(),
      p_password: password
    })

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    const user = data[0]
    const session = createSessionCookie(user)

    const response = NextResponse.json({ 
      success: true,
      rol: user.rol
    })

    response.cookies.set(
      session.name,
      session.value,
      session.options
    )

    return response

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}
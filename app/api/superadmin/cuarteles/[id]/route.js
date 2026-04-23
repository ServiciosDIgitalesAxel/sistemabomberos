import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function PATCH(request, { params }) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('bv_session')
    if (!sessionCookie) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    if (session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = createAdminClient()

    const updates = {}
    if (body.nombre  !== undefined) updates.nombre         = body.nombre
    if (body.activa  !== undefined) updates.activa         = body.activa
    if (body.color   !== undefined) updates.color_primario = body.color
    if (body.logoUrl !== undefined) updates.logo_url       = body.logoUrl

    const { error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
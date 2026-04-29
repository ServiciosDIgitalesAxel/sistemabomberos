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

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { subscription } = await request.json()
  if (!subscription) return NextResponse.json({ error: 'Sin suscripción' }, { status: 400 })

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: session.id,
      org_id:  session.org_id,
      subscription
    }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createAdminClient()
  await supabase.from('push_subscriptions').delete().eq('user_id', session.id)
  return NextResponse.json({ success: true })
}
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import webpush from 'web-push'

if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}
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

  const { titulo, cuerpo, url, userIds } = await request.json()
  const supabase = createAdminClient()

  // Obtener suscripciones
  let q = supabase
    .from('push_subscriptions')
    .select('subscription, user_id')
    .eq('org_id', session.org_id)

  if (userIds?.length) q = q.in('user_id', userIds)

  const { data: subs } = await q
  if (!subs?.length) return NextResponse.json({ enviados: 0 })

  const payload = JSON.stringify({
    title: titulo || 'Sistema Bomberos',
    body:  cuerpo || '',
    icon:  '/icons/icon-192x192.png',
    url:   url || '/home',
  })

  let enviados = 0
  const eliminados = []

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(sub.subscription, payload)
        enviados++
      } catch (err) {
        // Suscripción expirada o inválida → eliminar
        if (err.statusCode === 410 || err.statusCode === 404) {
          eliminados.push(sub.user_id)
        }
      }
    })
  )

  // Limpiar suscripciones inválidas
  if (eliminados.length) {
    await supabase.from('push_subscriptions').delete().in('user_id', eliminados)
  }

  return NextResponse.json({ success: true, enviados })
}
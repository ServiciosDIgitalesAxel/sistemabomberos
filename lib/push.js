import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function enviarNotificacion({ orgId, userIds, titulo, cuerpo, url = '/home' }) {
  const supabase = createAdminClient()

  let q = supabase
    .from('push_subscriptions')
    .select('subscription, user_id')
    .eq('org_id', orgId)

  if (userIds?.length) q = q.in('user_id', userIds)

  const { data: subs } = await q
  if (!subs?.length) return { enviados: 0 }

  const payload = JSON.stringify({
    title: titulo,
    body:  cuerpo,
    icon:  '/icons/icon-192x192.png',
    url,
  })

  let enviados = 0
  const eliminados = []

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(sub.subscription, payload)
        enviados++
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          eliminados.push(sub.user_id)
        }
      }
    })
  )

  if (eliminados.length) {
    await supabase.from('push_subscriptions').delete().in('user_id', eliminados)
  }

  return { enviados }
}
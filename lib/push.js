import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

function initWebPush() {
  if (
    process.env.VAPID_EMAIL &&
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
    return true
  }
  return false
}

export async function enviarNotificacion({ orgId, userIds, titulo, cuerpo, url = '/home' }) {
  if (!initWebPush()) {
    console.warn('VAPID no configurado, notificaciones deshabilitadas')
    return { enviados: 0 }
  }

  const supabase = createAdminClient()

  let q = supabase
    .from('push_subscriptions')
    .select('subscription, user_id')
    .eq('org_id', orgId)

  if (userIds?.length) q = q.in('user_id', userIds)

  const { data: subs, error } = await q
  if (error || !subs?.length) return { enviados: 0 }

  const payload = JSON.stringify({ title: titulo, body: cuerpo, url })
  let enviados = 0
  const eliminar = []

  await Promise.allSettled(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(sub.subscription, payload)
        enviados++
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          eliminar.push(sub.user_id)
        }
      }
    })
  )

  if (eliminar.length) {
    await supabase.from('push_subscriptions').delete().in('user_id', eliminar)
  }

  return { enviados }
}
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { enviarNotificacion } from '@/lib/push'

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) return null
  try {
    return JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { return null }
}

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false })

  await enviarNotificacion({
    orgId:   session.org_id,
    userIds: [session.id],
    titulo:  `Bienvenido, ${session.nombre.split(' ')[0]} 👋`,
    cuerpo:  'Las notificaciones están activas. Te avisaremos cuando haya novedades en el cuartel.',
    url:     '/home'
  })

  return NextResponse.json({ ok: true })
}
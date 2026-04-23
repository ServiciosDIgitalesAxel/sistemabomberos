import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SuperEstadisticasClient from './SuperEstadisticasClient'

export default async function SuperEstadisticasPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (session.rol !== 'superadmin') redirect('/home')

  return <SuperEstadisticasClient session={session} />
}
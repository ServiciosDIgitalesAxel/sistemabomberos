import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PerfilClient from './PerfilClient'

export default async function PerfilPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  return <PerfilClient session={session} />
}
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default async function RootPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')

  if (sessionCookie) {
    try {
      const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (session?.id) redirect('/home')
    } catch {}
  }

  return <LandingPage />
}
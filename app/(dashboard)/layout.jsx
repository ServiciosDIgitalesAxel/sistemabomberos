import { cookies } from 'next/headers'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  let session = null
  try {
    if (sessionCookie) {
      session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    }
  } catch {}

  return <DashboardShell session={session}>{children}</DashboardShell>
}
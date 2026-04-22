import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CuartelesClient from './CuartelesClient'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function CuartelesPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (session.rol !== 'superadmin') redirect('/home')

  const supabase = createAdminClient()
  const { data: cuarteles } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  return <CuartelesClient cuarteles={cuarteles || []} session={session} />
}
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import GuardiasClient from './GuardiasClient'

export default async function GuardiasPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('bv_session')
  if (!sessionCookie) redirect('/login')

  let session
  try {
    session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
  } catch { redirect('/login') }

  if (!['admin', 'superadmin'].includes(session.rol)) redirect('/home')

  const supabase = createAdminClient()
  const { data: guardias } = await supabase
    .from('guards')
    .select('*, user_guards(user_id, users(id, nombre, jerarquia))')
    .eq('org_id', session.org_id)
    .order('created_at')

  return <GuardiasClient guardias={guardias || []} session={session} />
}
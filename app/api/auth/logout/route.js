import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/session'

export async function POST() {
  const session = deleteSessionCookie()
  const response = NextResponse.json({ success: true })
  response.cookies.set(session.name, session.value, session.options)
  return response
}
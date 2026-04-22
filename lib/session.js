import { cookies } from 'next/headers'

const SESSION_COOKIE = 'bv_session'

export function getSession() {
  const cookieStore = cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return null
  
  try {
    return JSON.parse(Buffer.from(session.value, 'base64').toString())
  } catch {
    return null
  }
}

export function createSessionCookie(userData) {
  const sessionData = Buffer.from(JSON.stringify(userData)).toString('base64')
  return {
    name: SESSION_COOKIE,
    value: sessionData,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    }
  }
}

export function deleteSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: '',
    options: {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    }
  }
}
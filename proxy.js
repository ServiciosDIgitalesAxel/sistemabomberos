import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login']

export function proxy(request) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('bv_session')

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const session = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    )

    if (pathname.startsWith('/superadmin') && session.rol !== 'superadmin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    if (pathname.startsWith('/admin') &&
        !['superadmin', 'admin', 'jefe'].includes(session.rol)) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|api).*)',
  ],
}
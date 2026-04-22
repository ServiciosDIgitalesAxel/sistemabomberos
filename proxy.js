import { NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login']

const ROLE_ROUTES = {
  superadmin: ['/superadmin', '/admin', '/home'],
  admin:      ['/admin', '/home'],
  jefe:       ['/home'],
  bombero:    ['/home'],
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('bv_session')

  // Rutas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  // Sin sesión, al login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar permisos por ruta
  try {
    const session = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    )

    if (pathname.startsWith('/superadmin') && session.rol !== 'superadmin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    if (pathname.startsWith('/admin') && 
        !['superadmin', 'admin'].includes(session.rol)) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|api).*)'],
}
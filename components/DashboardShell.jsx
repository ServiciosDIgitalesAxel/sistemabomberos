'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardShell({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Leer sesión del cookie
    const cookies = document.cookie.split(';')
    const sessionCookie = cookies.find(c => c.trim().startsWith('bv_session='))
    if (sessionCookie) {
      try {
        const val = sessionCookie.split('=').slice(1).join('=').trim()
        const parsed = JSON.parse(atob(val))
        setSession(parsed)
      } catch {}
    }
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navItems = getNavItems(session, router)

  return (
    <div className="flex min-h-screen min-h-dvh bg-[#020810]">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#030d1a] border-r border-white/5
                        sticky top-0 h-screen overflow-y-auto flex-shrink-0">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
                 className="w-9 h-9 object-contain" />
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                Sistema Bomberos
              </div>
              <div className="text-white/40 text-xs">
                {session?.org_nombre || '...'}
              </div>
            </div>
          </div>
        </div>

        {/* Usuario */}
        {session && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b01e1e] to-[#7a0000]
                              flex items-center justify-center text-white text-xs font-bold
                              flex-shrink-0">
                {getInitials(session.nombre)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">
                  {session.nombre}
                </div>
                <div className="text-white/40 text-xs truncate">
                  {getRolLabel(session.rol)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {navItems.map((item, i) => {
            if (item.type === 'divider') {
              return (
                <div key={i} className="text-white/25 text-xs font-bold uppercase
                                        tracking-wider px-3 pt-4 pb-1">
                  {item.label}
                </div>
              )
            }
            const isActive = pathname === item.href
            return (
              <button
                key={i}
                onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                            font-medium transition-all w-full text-left ${
                  isActive
                    ? 'bg-[#b01e1e]/20 text-white border border-[#b01e1e]/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/5">
          <button
            onClick={() => router.push('/perfil')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       font-medium text-white/60 hover:bg-white/5 hover:text-white
                       transition-all w-full text-left mb-1"
          >
            <span className="text-base w-5 text-center">👤</span>
            <span>Mi perfil</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                       font-medium text-red-400/70 hover:bg-red-900/20 hover:text-red-400
                       transition-all w-full text-left"
          >
            <span className="text-base w-5 text-center">🔓</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar mobile — overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-[#030d1a] border-r border-white/5
                            h-full overflow-y-auto flex flex-col z-10">

            <div className="px-5 py-5 border-b border-white/5 flex items-center
                            justify-between">
              <div className="flex items-center gap-3">
                <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
                     className="w-8 h-8 object-contain" />
                <div className="text-white font-bold text-sm">Sistema Bomberos</div>
              </div>
              <button onClick={() => setSidebarOpen(false)}
                      className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            {session && (
              <div className="px-4 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b01e1e] to-[#7a0000]
                                  flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(session.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{session.nombre}</div>
                    <div className="text-white/40 text-xs">{getRolLabel(session.rol)}</div>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
              {navItems.map((item, i) => {
                if (item.type === 'divider') {
                  return (
                    <div key={i} className="text-white/25 text-xs font-bold uppercase
                                            tracking-wider px-3 pt-4 pb-1">
                      {item.label}
                    </div>
                  )
                }
                const isActive = pathname === item.href
                return (
                  <button key={i}
                          onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                      font-medium transition-all w-full text-left ${
                            isActive
                              ? 'bg-[#b01e1e]/20 text-white border border-[#b01e1e]/30'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}>
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="px-3 py-3 border-t border-white/5">
              <button onClick={() => { router.push('/perfil'); setSidebarOpen(false) }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                 font-medium text-white/60 hover:bg-white/5 hover:text-white
                                 transition-all w-full text-left mb-1">
                <span>👤</span><span>Mi perfil</span>
              </button>
              <button onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                 font-medium text-red-400/70 hover:bg-red-900/20 hover:text-red-400
                                 transition-all w-full text-left">
                <span>🔓</span><span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* Header mobile */}
        <header className="lg:hidden bg-[#841616] px-4 py-3 flex items-center
                           gap-3 sticky top-0 z-40 shadow-lg">
          <button onClick={() => setSidebarOpen(true)}
                  className="flex flex-col gap-1 p-2 rounded-lg bg-white/10
                             hover:bg-white/20 transition-all">
            <span className="block w-4 h-0.5 bg-white rounded" />
            <span className="block w-4 h-0.5 bg-white rounded" />
            <span className="block w-4 h-0.5 bg-white rounded" />
          </button>
          <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
               className="w-7 h-7 object-contain" />
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm truncate">
              {session?.org_nombre || 'Sistema Bomberos'}
            </div>
          </div>
          <button onClick={() => router.push('/perfil')}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b01e1e] to-[#7a0000]
                             flex items-center justify-center text-white text-xs font-bold
                             flex-shrink-0">
            {getInitials(session?.nombre)}
          </button>
        </header>

        {/* Página */}
        <div className="flex-1">
          {children}
        </div>

      </main>
    </div>
  )
}

function getNavItems(session, router) {
  if (!session) return []

  const items = []

  if (session.rol === 'superadmin') {
    items.push({ type: 'divider', label: 'Super Admin' })
    items.push({ icon: '🏛️', label: 'Cuarteles',           href: '/superadmin/cuarteles' })
    items.push({ icon: '👥', label: 'Todos los Usuarios',  href: '/superadmin/usuarios' })
    items.push({ icon: '📊', label: 'Estadísticas Globales',href: '/superadmin/estadisticas' })
    return items
  }

  if (['admin', 'jefe'].includes(session.rol)) {
    items.push({ type: 'divider', label: 'Panel' })
    if (session.rol === 'admin') {
      items.push({ icon: '👥', label: 'Usuarios',    href: '/admin/usuarios' })
      items.push({ icon: '🚒', label: 'Guardias',    href: '/admin/guardias' })
      items.push({ icon: '📋', label: 'Actividades', href: '/admin/actividades' })
    }
    items.push({ icon: '📊', label: 'Estadísticas', href: '/admin/estadisticas' })
    items.push({ icon: '📝', label: 'Reg. Masivo',  href: '/admin/masivo' })
    items.push({ icon: '📁', label: 'Registros',    href: '/admin/registros' })
  }

  items.push({ type: 'divider', label: 'Asistencia' })
  items.push({ icon: '🏠', label: 'Inicio', href: '/home' })

  return items
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map(p => p[0].toUpperCase()).join('')
}

function getRolLabel(rol) {
  const labels = {
    superadmin: 'Super Admin', admin: 'Administrador',
    jefe: 'Jefe de Guardia', bombero: 'Bombero'
  }
  return labels[rol] || rol
}
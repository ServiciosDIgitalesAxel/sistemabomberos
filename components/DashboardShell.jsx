'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

export default function DashboardShell({ children, session }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [actividades, setActividades] = useState([])
  const [registradosHoy, setRegistradosHoy] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!session) return
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setActividades(d.actividades || [])
        setRegistradosHoy(d.registradosHoy || {})
      })
      .catch(() => {})
  }, [session])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const adminItems = getAdminItems(session)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
<div className="px-4 py-4 border-b border-white/6 cursor-pointer sidebar-bg"
     onClick={() => { router.push('/home'); setSidebarOpen(false) }}>
  <div className="flex items-center gap-2.5">
    <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
         className="w-8 h-8 object-contain flex-shrink-0" />
    <div className="min-w-0">
      <div className="font-semibold text-sm text-white sidebar-text leading-tight">
        Sistema Bomberos
      </div>
      <div className="text-xs text-white/40 sidebar-muted truncate">
        {session?.org_nombre || ''}
      </div>
    </div>
  </div>
</div>

      {/* Usuario */}
      {session && (
        <div className="px-4 py-3 border-b border-white/6 cursor-pointer
                        hover:bg-white/4"
             onClick={() => { router.push('/perfil'); setSidebarOpen(false) }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-700 flex items-center
                            justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(session.nombre)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {session.nombre}
              </div>
              <div className="text-xs text-white/40">{getRolLabel(session.rol)}</div>
            </div>
            <span className="text-white/20 text-xs flex-shrink-0">›</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">

        <NavItem icon="🏠" label="Inicio"
                 active={pathname === '/home'}
                 onClick={() => { router.push('/home'); setSidebarOpen(false) }} />

        {session?.rol !== 'superadmin' && (
          <NavItem icon="📈" label="Mis Estadísticas"
                   active={pathname === '/mis-estadisticas'}
                   onClick={() => { router.push('/mis-estadisticas'); setSidebarOpen(false) }} />
        )}

        {adminItems.length > 0 && (
          <>
            <Divider label="Panel" />
            {adminItems.map((item, i) => (
              <NavItem key={i} icon={item.icon} label={item.label}
                       active={pathname === item.href}
                       onClick={() => { router.push(item.href); setSidebarOpen(false) }} />
            ))}
          </>
        )}

        {actividades.length > 0 && session?.rol !== 'superadmin' && (
          <>
            <Divider label="Registrar hoy" />
            {actividades.map(act => {
              const reg = registradosHoy[act.id]
              return (
                <button key={act.id}
                        onClick={() => { router.push(`/asistencia/${act.id}`); setSidebarOpen(false) }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg
                                    text-sm w-full text-left ${
                          reg
                            ? 'text-green-400 bg-green-900/20'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}>
                  <span className="text-sm w-5 text-center flex-shrink-0">{act.icono}</span>
                  <span className="flex-1 truncate text-xs">{act.nombre}</span>
                  {reg
                    ? <span className="text-green-400 text-xs flex-shrink-0">✓</span>
                    : <span className="text-white/20 text-xs flex-shrink-0">›</span>
                  }
                </button>
              )
            })}
          </>
        )}

        {session?.rol === 'superadmin' && (
          <>
            <Divider label="Super Admin" />
            {[
              { icon: '🏛️', label: 'Cuarteles',            href: '/superadmin/cuarteles' },
              { icon: '👥', label: 'Todos los Usuarios',    href: '/superadmin/usuarios' },
              { icon: '📊', label: 'Estadísticas Globales', href: '/superadmin/estadisticas' },
            ].map((item, i) => (
              <NavItem key={i} icon={item.icon} label={item.label}
                       active={pathname.startsWith(item.href)}
                       onClick={() => { router.push(item.href); setSidebarOpen(false) }} />
            ))}
          </>
        )}

      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/6">
        <NavItem icon="👤" label="Mi perfil"
                 active={pathname === '/perfil'}
                 onClick={() => { router.push('/perfil'); setSidebarOpen(false) }} />
        <button onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                           font-medium text-red-400 hover:bg-red-900/20
                           w-full text-left mt-0.5">
          <span className="w-5 text-center text-sm">🔓</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen min-h-dvh bg-[#060e1e]">

      {/* Sidebar desktop */}
<aside className="sidebar-bg hidden lg:flex flex-col w-60 border-r
                  sticky top-0 h-screen overflow-y-auto flex-shrink-0
                  bg-[#030912] border-white/6">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60"
               onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#030912] border-r border-white/6
                            h-full overflow-y-auto flex flex-col z-10">
            <div className="absolute top-3 right-3">
              <button onClick={() => setSidebarOpen(false)}
                      className="text-white/40 hover:text-white bg-white/8
                                 rounded-lg px-2 py-1 text-sm">
                ✕
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenido */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        <header className="lg:hidden bg-[#030912] border-b border-white/6
                           px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/8 flex flex-col
                             gap-1 flex-shrink-0">
            <span className="block w-4 h-0.5 bg-white/60 rounded" />
            <span className="block w-4 h-0.5 bg-white/60 rounded" />
            <span className="block w-4 h-0.5 bg-white/60 rounded" />
          </button>
          <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
               className="w-7 h-7 object-contain flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white truncate">
              {session?.org_nombre || 'Sistema Bomberos'}
            </div>
          </div>
          <button onClick={() => router.push('/perfil')}
                  className="w-8 h-8 rounded-full bg-red-700 flex items-center
                             justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(session?.nombre)}
          </button>
        </header>

        <div className="flex-1 bg-[#060e1e]">
          {children}
        </div>

      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                        font-medium w-full text-left ${
              active
                ? 'bg-red-900/25 text-red-400'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}>
      <span className="text-sm w-5 text-center flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function Divider({ label }) {
  return (
    <div className="text-white/25 text-xs font-semibold uppercase tracking-wider
                    px-3 pt-4 pb-1">
      {label}
    </div>
  )
}

function getAdminItems(session) {
  if (!session) return []
  if (session.rol === 'admin') {
    return [
      { icon: '👥', label: 'Usuarios',    href: '/admin/usuarios' },
      { icon: '🚒', label: 'Guardias',    href: '/admin/guardias' },
      { icon: '📋', label: 'Actividades', href: '/admin/actividades' },
      { icon: '📊', label: 'Estadísticas',href: '/admin/estadisticas' },
      { icon: '📝', label: 'Reg. Masivo', href: '/admin/masivo' },
      { icon: '📁', label: 'Registros',   href: '/admin/registros' },
    ]
  }
  if (session.rol === 'jefe') {
    return [
      { icon: '📊', label: 'Estadísticas',href: '/admin/estadisticas' },
      { icon: '📝', label: 'Reg. Masivo', href: '/admin/masivo' },
      { icon: '📁', label: 'Registros',   href: '/admin/registros' },
    ]
  }
  return []
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
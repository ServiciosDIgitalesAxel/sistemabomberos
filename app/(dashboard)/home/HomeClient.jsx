'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeClient({ session, actividades, guardias }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const esAdmin = ['admin', 'superadmin'].includes(session.rol)
  const esJefe  = session.rol === 'jefe'

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      {/* Header */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <div className="text-white font-bold text-base leading-tight">
            {session.org_nombre}
          </div>
          <div className="text-white/60 text-xs mt-0.5">Sistema de Asistencias</div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-white/10 hover:bg-white/20 border border-white/20
                     text-white text-xs font-semibold px-3 py-2 rounded-lg
                     transition-all disabled:opacity-50"
        >
          {loggingOut ? '...' : 'Salir'}
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 bg-[#0a1830] border-b border-white/5">
        <div className="text-white font-semibold text-base">{session.nombre}</div>
        <div className="text-white/50 text-sm mt-0.5">
          {session.jerarquia && `${session.jerarquia} · `}
          {getRolLabel(session.rol)}
          {guardias.length > 0 && ` · ${guardias.map(g => g.nombre).join(', ')}`}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-5">

        {/* Panel admin */}
        {(esAdmin || esJefe) && (
          <div className="flex flex-col gap-3">
            <SectionTitle title={esAdmin ? 'Panel Administrador' : 'Panel Jefe de Guardia'} />
            <div className="grid grid-cols-2 gap-3">
              {esAdmin && (
                <>
                  <ActionButton icon="👥" title="Usuarios" color="blue"
                    onClick={() => router.push('/admin/usuarios')} />
                  <ActionButton icon="🚒" title="Guardias" color="red"
                    onClick={() => router.push('/admin/guardias')} />
                  <ActionButton icon="📋" title="Actividades" color="gold"
                    onClick={() => router.push('/admin/actividades')} />
                  <ActionButton icon="📊" title="Estadísticas" color="green"
                    onClick={() => router.push('/admin/estadisticas')} />
                    <ActionButton icon="📝" title="Reg. Masivo" color="blue"
  onClick={() => router.push('/admin/masivo')} />
                </>
              )}
              {esJefe && (
                <>
                  <ActionButton icon="📊" title="Mi Guardia" color="blue"
                    onClick={() => router.push('/admin/estadisticas')} />
                  <ActionButton icon="📋" title="Reg. Masivo" color="gold"
                    onClick={() => router.push('/admin/masivo')} />
                </>
              )}
            </div>
          </div>
        )}
{/* SUPERADMIN */}
{session.rol === 'superadmin' && (
  <div className="flex flex-col gap-4">
    <SectionTitle title="Panel Super Administrador" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ActionButton
        icon="🏛️" title="Gestionar Cuarteles"
        sub="Crear y administrar organizaciones"
        color="blue"
        onClick={() => router.push('/superadmin/cuarteles')}
      />
      <ActionButton
        icon="👥" title="Todos los Usuarios"
        sub="Ver usuarios de todos los cuarteles"
        color="red"
        onClick={() => router.push('/superadmin/usuarios')}
      />
      <ActionButton
        icon="📊" title="Estadísticas Globales"
        sub="Resumen de toda la plataforma"
        color="gold"
        onClick={() => router.push('/superadmin/estadisticas')}
      />
    </div>
  </div>
)}
        {/* Actividades */}
        {actividades.length > 0 ? (
          <div className="flex flex-col gap-3">
            <SectionTitle title="Registrar Asistencia" />
            {actividades.map(act => (
              <ActivityButton
                key={act.id}
                actividad={act}
                onClick={() => router.push(
                  `/asistencia/${act.id}?tipo=${act.tipo_base}&nombre=${encodeURIComponent(act.nombre)}`
                )}
              />
            ))}
          </div>
        ) : (
          !esAdmin && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-8
                            text-center text-white/40 text-sm">
              No hay actividades configuradas todavía
            </div>
          )
        )}

      </div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div className="relative pb-3 mb-1">
      <h2 className="text-white text-xl font-bold text-center">{title}</h2>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2
                      w-10 h-0.5 bg-[#b01e1e] rounded-full" />
    </div>
  )
}

function ActivityButton({ actividad, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border text-left px-4 py-4
                 flex items-center gap-3 transition-all
                 hover:-translate-y-0.5 hover:shadow-lg active:scale-95
                 relative overflow-hidden bg-[#0a1830] border-white/10
                 hover:border-white/20"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
           style={{ background: actividad.color }} />
      <span className="text-2xl ml-1">{actividad.icono}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-white uppercase tracking-wide">
          {actividad.nombre}
        </div>
        <div className="text-xs mt-0.5 text-white/40">
          {getTipoLabel(actividad.tipo_base)} ·{' '}
          {(actividad.estados || []).slice(0, 3).join(', ')}
          {(actividad.estados || []).length > 3 && '...'}
        </div>
      </div>
      <span className="text-white/40 text-lg">›</span>
    </button>
  )
}

function ActionButton({ icon, title, color, onClick }) {
  const colors = {
    blue:  'bg-[#0e2245] border-[#1a3d7a] text-[#7aa2de]',
    red:   'bg-[#2a0808] border-[#5c1010] text-[#f07070]',
    gold:  'bg-[#251a00] border-[#5a4200] text-[#f8cf70]',
    green: 'bg-[#061a10] border-[#0d4020] text-[#7ecfa4]',
  }
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 flex flex-col items-center gap-2
                  transition-all hover:-translate-y-0.5 hover:shadow-lg
                  active:scale-95 ${colors[color]}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
    </button>
  )
}

function getRolLabel(rol) {
  const labels = {
    superadmin: 'Super Admin', admin: 'Administrador',
    jefe: 'Jefe de Guardia', bombero: 'Bombero'
  }
  return labels[rol] || rol
}

function getTipoLabel(tipo) {
  const labels = {
    actividad: 'Actividad', guardia: 'Guardia',
    evento: 'Evento', custom: 'Custom'
  }
  return labels[tipo] || tipo
}
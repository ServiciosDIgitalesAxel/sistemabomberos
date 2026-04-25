'use client'

import { useRouter } from 'next/navigation'

export default function HomeClient({ session, actividades, guardias, registradosHoy }) {
  const router = useRouter()

  const esAdmin      = session.rol === 'admin'
  const esSuperAdmin = session.rol === 'superadmin'
  const esJefe       = session.rol === 'jefe'
  const esBombero    = session.rol === 'bombero'

  return (
    <div className="flex flex-col min-h-screen bg-[#020810]">

      {/* Header mobile — oculto en desktop porque el shell lo maneja */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 shadow-lg lg:hidden">
        <div className="flex-1">
          <div className="text-white font-bold text-base leading-tight">
            {session.org_nombre}
          </div>
          <div className="text-white/60 text-xs mt-0.5">Sistema de Asistencias</div>
        </div>
        <button
          onClick={() => router.push('/perfil')}
          className="w-8 h-8 rounded-full bg-white/15 border border-white/20
                     flex items-center justify-center text-white text-xs font-bold"
        >
          {getInitials(session.nombre)}
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 bg-[#0a1830] border-b border-white/5">
        <div className="text-white font-semibold text-base">{session.nombre}</div>
        <div className="text-white/50 text-sm mt-0.5">
          {session.jerarquia && `${session.jerarquia} · `}
          {getRolLabel(session.rol)}
          {guardias?.length > 0 && ` · ${guardias.map(g => g.nombre).join(', ')}`}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-5 max-w-2xl mx-auto w-full">

        {/* SUPERADMIN */}
        {esSuperAdmin && (
          <div className="flex flex-col gap-4">
            <SectionTitle title="Panel Super Administrador" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionButton icon="🏛️" title="Cuarteles"
                sub="Crear y administrar" color="blue"
                onClick={() => router.push('/superadmin/cuarteles')} />
              <ActionButton icon="👥" title="Usuarios"
                sub="Todos los cuarteles" color="red"
                onClick={() => router.push('/superadmin/usuarios')} />
              <ActionButton icon="📊" title="Estadísticas"
                sub="Resumen global" color="gold"
                onClick={() => router.push('/superadmin/estadisticas')} />
            </div>
          </div>
        )}

        {/* ADMIN */}
        {esAdmin && (
          <div className="flex flex-col gap-4">
            <SectionTitle title="Panel Administrador" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionButton icon="👥" title="Usuarios"
                sub="Gestionar personal" color="blue"
                onClick={() => router.push('/admin/usuarios')} />
              <ActionButton icon="🚒" title="Guardias"
                sub="Configurar guardias" color="red"
                onClick={() => router.push('/admin/guardias')} />
              <ActionButton icon="📋" title="Actividades"
                sub="Tipos de registro" color="gold"
                onClick={() => router.push('/admin/actividades')} />
              <ActionButton icon="📊" title="Estadísticas"
                sub="Ver asistencias" color="green"
                onClick={() => router.push('/admin/estadisticas')} />
              <ActionButton icon="📝" title="Reg. Masivo"
                sub="Registrar grupo" color="blue"
                onClick={() => router.push('/admin/masivo')} />
              <ActionButton icon="📁" title="Registros"
                sub="Ver y exportar" color="green"
                onClick={() => router.push('/admin/registros')} />
            </div>
            {actividades?.length > 0 && (
              <>
                <SectionTitle title="Mi Asistencia Hoy" />
                <div className="flex flex-col gap-2">
                  {actividades.map(act => (
                    <ActivityButton
                      key={act.id}
                      actividad={act}
                      registrado={registradosHoy?.[act.id]}
                      onClick={() => router.push(`/asistencia/${act.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* JEFE */}
        {esJefe && (
          <div className="flex flex-col gap-4">
            <SectionTitle title="Panel Jefe de Guardia" />
            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon="📊" title="Estadísticas"
                sub="Ver mi guardia" color="blue"
                onClick={() => router.push('/admin/estadisticas')} />
              <ActionButton icon="📝" title="Reg. Masivo"
                sub="Registrar guardia" color="gold"
                onClick={() => router.push('/admin/masivo')} />
              <ActionButton icon="📁" title="Registros"
                sub="Ver y exportar" color="green"
                onClick={() => router.push('/admin/registros')} />
            </div>
            {actividades?.length > 0 && (
              <>
                <SectionTitle title="Mi Asistencia Hoy" />
                <div className="flex flex-col gap-2">
                  {actividades.map(act => (
                    <ActivityButton
                      key={act.id}
                      actividad={act}
                      registrado={registradosHoy?.[act.id]}
                      onClick={() => router.push(`/asistencia/${act.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* BOMBERO */}
        {esBombero && (
          <div className="flex flex-col gap-4">
            <SectionTitle title="Registrar Asistencia Hoy" />
            {actividades?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {actividades.map(act => (
                  <ActivityButton
                    key={act.id}
                    actividad={act}
                    registrado={registradosHoy?.[act.id]}
                    onClick={() => router.push(`/asistencia/${act.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/4 border border-white/8 rounded-xl p-8
                              text-center text-white/40 text-sm">
                No hay actividades configuradas todavía
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Componentes ────────────────────────────────────────

function SectionTitle({ title }) {
  return (
    <div className="relative pb-3 mb-1">
      <h2 className="text-white text-xl font-bold text-center">{title}</h2>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2
                      w-10 h-0.5 bg-[#b01e1e] rounded-full" />
    </div>
  )
}

function ActivityButton({ actividad, registrado, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border text-left px-4 py-4
                 flex items-center gap-3 transition-all
                 hover:-translate-y-0.5 hover:shadow-lg active:scale-95
                 relative overflow-hidden
                 bg-[#0a1830] border-white/10 hover:border-white/20"
    >
      {/* Barra de color izquierda */}
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

      {/* Badge de registrado hoy */}
      {registrado ? (
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full
                           bg-green-900/50 text-green-400 border border-green-500/30">
            ✅ {registrado.estado}
          </span>
          {registrado.hora && (
            <span className="text-white/30 text-xs">{registrado.hora}</span>
          )}
        </div>
      ) : (
        <span className="text-white/40 text-lg flex-shrink-0">›</span>
      )}
    </button>
  )
}

function ActionButton({ icon, title, sub, color, onClick }) {
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
      {sub && <span className="text-xs opacity-60 text-center leading-tight">{sub}</span>}
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

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map(p => p[0].toUpperCase()).join('')
}
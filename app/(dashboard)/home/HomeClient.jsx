'use client'

import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function HomeClient({ session, actividades, guardias, registradosHoy, historial }) {
  const router = useRouter()

  const esAdmin      = session.rol === 'admin'
  const esSuperAdmin = session.rol === 'superadmin'
  const esJefe       = session.rol === 'jefe'
  const esBombero    = session.rol === 'bombero'

  return (
    <PageShell
      title={`Bienvenido, ${session.nombre.split(' ')[0]}`}
      subtitle={`${session.jerarquia ? session.jerarquia + ' · ' : ''}${getRolLabel(session.rol)}${guardias?.length > 0 ? ' · ' + guardias.map(g => g.nombre).join(', ') : ''}`}
    >
      <div className="flex flex-col gap-6">

        {/* SUPERADMIN */}
        {esSuperAdmin && (
          <Section title="Panel Super Administrador">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ActionCard icon="🏛️" title="Cuarteles"
                          sub="Crear y administrar organizaciones"
                          onClick={() => router.push('/superadmin/cuarteles')} />
              <ActionCard icon="👥" title="Usuarios"
                          sub="Todos los cuarteles"
                          onClick={() => router.push('/superadmin/usuarios')} />
              <ActionCard icon="📊" title="Estadísticas"
                          sub="Resumen global de la plataforma"
                          onClick={() => router.push('/superadmin/estadisticas')} />
            </div>
          </Section>
        )}

        {/* ADMIN */}
        {esAdmin && (
          <>
            <Section title="Administración">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActionCard icon="👥" title="Usuarios"
                            onClick={() => router.push('/admin/usuarios')} />
                <ActionCard icon="🚒" title="Guardias"
                            onClick={() => router.push('/admin/guardias')} />
                <ActionCard icon="📋" title="Actividades"
                            onClick={() => router.push('/admin/actividades')} />
                <ActionCard icon="📊" title="Estadísticas"
                            onClick={() => router.push('/admin/estadisticas')} />
                <ActionCard icon="📝" title="Reg. Masivo"
                            onClick={() => router.push('/admin/masivo')} />
                <ActionCard icon="📁" title="Registros"
                            onClick={() => router.push('/admin/registros')} />
              </div>
            </Section>
            {actividades?.length > 0 && (
              <Section title="Mi Asistencia Hoy">
                <ActivityList actividades={actividades}
                              registradosHoy={registradosHoy}
                              router={router} />
              </Section>
            )}
          </>
        )}

        {/* JEFE */}
        {esJefe && (
          <>
            <Section title="Panel Jefe de Guardia">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ActionCard icon="📊" title="Estadísticas"
                            onClick={() => router.push('/admin/estadisticas')} />
                <ActionCard icon="📝" title="Reg. Masivo"
                            onClick={() => router.push('/admin/masivo')} />
                <ActionCard icon="📁" title="Registros"
                            onClick={() => router.push('/admin/registros')} />
              </div>
            </Section>
            {actividades?.length > 0 && (
              <Section title="Mi Asistencia Hoy">
                <ActivityList actividades={actividades}
                              registradosHoy={registradosHoy}
                              router={router} />
              </Section>
            )}
          </>
        )}

        {/* BOMBERO */}
        {esBombero && (
          <Section title="Registrar Asistencia">
            {actividades?.length > 0 ? (
              <ActivityList actividades={actividades}
                            registradosHoy={registradosHoy}
                            router={router} />
            ) : (
              <EmptyState text="No hay actividades configuradas todavía" />
            )}
          </Section>
        )}

        {/* Historial */}
        {!esSuperAdmin && historial?.length > 0 && (
          <Section title="Últimos registros"
                   action={{ label: 'Ver todo →', onClick: () => router.push('/mis-estadisticas') }}>
            <div className="bg-[#0a1830] border border-white/8 rounded-xl
                            divide-y divide-white/5">
              {historial.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-base flex-shrink-0">
                    {r.activity_types?.icono || '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-sm truncate">
                      {r.activity_types?.nombre || 'Actividad'}
                    </div>
                    <div className="text-white/30 text-xs mt-0.5">
                      {r.fecha} · {r.hora_ingreso?.substring(0, 5)}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                                    flex-shrink-0 ${
                    r.estado === 'Presente'
                      ? 'bg-green-900/40 text-green-400'
                      : r.estado === 'Ausente Justificado'
                      ? 'bg-red-900/40 text-red-400'
                      : 'bg-yellow-900/40 text-yellow-400'
                  }`}>
                    {r.estado}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>
    </PageShell>
  )
}

function Section({ title, children, action }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white/80 font-semibold text-sm uppercase
                       tracking-wider">{title}</h2>
        {action && (
          <button onClick={action.onClick}
                  className="text-white/30 hover:text-white/60 text-xs">
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function ActionCard({ icon, title, sub, onClick }) {
  return (
    <button onClick={onClick}
            className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                       flex flex-col items-center gap-2 text-center
                       hover:bg-[#0d1f38] hover:border-white/12 w-full">
      <span className="text-2xl">{icon}</span>
      <span className="text-white/80 text-xs font-semibold">{title}</span>
      {sub && <span className="text-white/30 text-xs leading-tight">{sub}</span>}
    </button>
  )
}

function ActivityList({ actividades, registradosHoy, router }) {
  return (
    <div className="flex flex-col gap-2">
      {actividades.map(act => {
        const reg = registradosHoy?.[act.id]
        return (
          <button key={act.id}
                  onClick={() => router.push(`/asistencia/${act.id}`)}
                  className={`w-full border rounded-xl px-4 py-3.5
                              flex items-center gap-3 text-left ${
                    reg
                      ? 'bg-green-900/15 border-green-500/20'
                      : 'bg-[#0a1830] border-white/8 hover:bg-[#0d1f38] hover:border-white/12'
                  }`}>
            <div className="w-0.5 self-stretch rounded-full flex-shrink-0"
                 style={{ background: act.color }} />
            <span className="text-xl flex-shrink-0">{act.icono}</span>
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm ${
                reg ? 'text-green-300' : 'text-white/80'
              }`}>
                {act.nombre}
              </div>
              <div className="text-white/30 text-xs mt-0.5">
                {getTipoLabel(act.tipo_base)}
              </div>
            </div>
            {reg ? (
              <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                <span className="text-xs font-medium text-green-400
                                 bg-green-900/40 px-2 py-0.5 rounded-full">
                  ✓ {reg.estado}
                </span>
                {reg.hora && (
                  <span className="text-white/25 text-xs">{reg.hora}</span>
                )}
              </div>
            ) : (
              <span className="text-white/20 flex-shrink-0">›</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl p-8
                    text-center text-white/30 text-sm">
      {text}
    </div>
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
    actividad: 'Actividad regular', guardia: 'Guardia',
    evento: 'Evento', custom: 'Personalizado'
  }
  return labels[tipo] || tipo
}
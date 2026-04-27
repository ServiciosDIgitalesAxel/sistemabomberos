'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function MisEstadisticasClient({ session, actividades }) {
  const router = useRouter()
  const [actividadId, setActividadId] = useState('')
  const [desde, setDesde] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  )
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const actividadSeleccionada = actividades.find(a => a.id === actividadId)

  async function buscar() {
    if (!actividadId) { setError('Seleccioná una actividad'); return }
    setLoading(true); setError(''); setData(null)
    try {
      const params = new URLSearchParams({
        actividadId, desde, hasta, usuarioId: session.id
      })
      const res = await fetch(`/api/admin/estadisticas?${params}`)
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setData(json)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const miData = data?.porBombero?.[0]
  const pct = data && data.resumen.diasUnicos > 0 && miData
    ? Math.round((miData.presentes / data.resumen.diasUnicos) * 100) : 0
  const colorPct = pct >= 80 ? '#1a7a46' : pct >= 60 ? '#c98000' : '#b01e1e'

  return (
    <PageShell title="Mis Estadísticas" subtitle={session.org_nombre}>
      <div className="max-w-lg mx-auto flex flex-col gap-4">

        {/* Mi info */}
        <div className="bg-[#0a1830] border border-white/8 rounded-xl px-4 py-4
                        flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-700 flex items-center
                          justify-center text-white font-bold flex-shrink-0">
            {getInitials(session.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{session.nombre}</div>
            <div className="text-white/40 text-sm">
              {session.jerarquia && `${session.jerarquia} · `}
              {getRolLabel(session.rol)}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                        flex flex-col gap-3">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            Filtros
          </div>

          <Field label="Actividad *">
            <select value={actividadId} onChange={e => setActividadId(e.target.value)}
                    className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                               px-3 py-2.5 text-white text-sm focus:outline-none">
              <option value="">Seleccioná una actividad</option>
              {actividades.map(a => (
                <option key={a.id} value={a.id}>{a.icono} {a.nombre}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde">
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                     className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                px-3 py-2.5 text-white text-sm focus:outline-none" />
            </Field>
            <Field label="Hasta">
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                     className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                px-3 py-2.5 text-white text-sm focus:outline-none" />
            </Field>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg
                            px-3 py-2 text-red-400 text-xs">{error}</div>
          )}

          <button onClick={buscar} disabled={loading}
                  className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                             text-white font-semibold py-3 rounded-xl text-sm">
            {loading ? '⏳ Cargando...' : '🔍 Ver mis estadísticas'}
          </button>
        </div>

        {/* Resultados */}
        {data && (
          <div className="flex flex-col gap-4">

            {/* Porcentaje */}
            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-6
                            flex flex-col items-center gap-3">
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                {actividadSeleccionada?.icono} {actividadSeleccionada?.nombre}
              </div>
              <div className="text-7xl font-bold" style={{ color: colorPct }}>
                {pct}%
              </div>
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                     style={{ width: `${pct}%`, background: colorPct }} />
              </div>
              <div className="text-white/30 text-sm">
                {miData?.presentes || 0} de {data.resumen.diasUnicos} días
              </div>
              <div className="text-white/20 text-xs">{desde} al {hasta}</div>
            </div>

            {/* Desglose */}
            {miData && Object.keys(miData.porEstado).length > 0 && (
              <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
                <div className="text-white/40 text-xs font-semibold uppercase
                                tracking-wider mb-3">Desglose</div>
                <div className="flex flex-col gap-2">
                  {Object.entries(miData.porEstado).map(([estado, cant]) => (
                    <div key={estado} className="flex items-center justify-between gap-3">
                      <span className="text-white/60 text-sm">{estado}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-white/8 w-28 overflow-hidden">
                          <div className="h-full rounded-full bg-red-700"
                               style={{
                                 width: `${(cant / (miData.total || 1)) * 100}%`
                               }} />
                        </div>
                        <span className="text-white font-medium text-sm w-5 text-right">
                          {cant}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historial */}
            {data.registros.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-white/40 text-xs font-semibold uppercase
                                tracking-wider">
                  Historial ({data.registros.length})
                </div>
                {data.registros.map(r => (
                  <div key={r.id}
                       className="bg-[#0a1830] border border-white/8 rounded-xl
                                  px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white/70 text-sm">{r.fecha}</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {r.hora_ingreso?.substring(0, 5)}
                        {r.guardia && ` · ${r.guardia}`}
                        {r.observaciones && ` · ${r.observaciones}`}
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
            )}

            {data.registros.length === 0 && (
              <div className="bg-[#0a1830] border border-white/8 rounded-xl p-8
                              text-center text-white/30 text-sm">
                Sin registros en este período
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-white/40 text-xs">{label}</label>}
      {children}
    </div>
  )
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
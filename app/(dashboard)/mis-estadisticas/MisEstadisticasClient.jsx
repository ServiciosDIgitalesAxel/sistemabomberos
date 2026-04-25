'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    setLoading(true)
    setError('')
    setData(null)

    try {
      const params = new URLSearchParams({
        actividadId,
        desde,
        hasta,
        usuarioId: session.id
      })
      const res = await fetch(`/api/admin/estadisticas?${params}`)
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setData(json)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const miData = data?.porBombero?.[0]
  const pct = data && data.resumen.diasUnicos > 0 && miData
    ? Math.round((miData.presentes / data.resumen.diasUnicos) * 100)
    : 0
  const colorPct = pct >= 80 ? '#1a7a46' : pct >= 60 ? '#c98000' : '#b01e1e'

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 lg:hidden">
        <button onClick={() => router.back()}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Mis Estadísticas</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
      </div>

      <div className="hidden lg:flex px-6 pt-6 pb-2">
        <button onClick={() => router.back()}
                className="bg-white/8 hover:bg-white/12 border border-white/10
                           text-white/70 text-xs font-semibold px-4 py-2 rounded-lg">
          ← Volver
        </button>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">

        {/* Mi info */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl px-5 py-4
                        flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b01e1e]
                          to-[#7a0000] flex items-center justify-center
                          text-white font-bold text-lg flex-shrink-0">
            {getInitials(session.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-base truncate">{session.nombre}</div>
            <div className="text-white/50 text-sm">
              {session.jerarquia && `${session.jerarquia} · `}
              {getRolLabel(session.rol)}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4
                        flex flex-col gap-3">
          <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
            Filtros
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs">Actividad *</label>
            <select value={actividadId} onChange={e => setActividadId(e.target.value)}
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white text-sm focus:outline-none">
              <option value="">Seleccioná una actividad</option>
              {actividades.map(a => (
                <option key={a.id} value={a.id}>{a.icono} {a.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Desde</label>
              <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                     className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                                text-white text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Hasta</label>
              <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                     className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                                text-white text-sm focus:outline-none" />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg
                            px-3 py-2 text-red-300 text-xs">{error}</div>
          )}

          <button onClick={buscar} disabled={loading}
                  className="w-full bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                             text-white font-bold py-3 rounded-xl transition-all">
            {loading ? '⏳ Cargando...' : '🔍 Ver mis estadísticas'}
          </button>
        </div>

        {/* Resultados */}
        {data && (
          <div className="flex flex-col gap-4">

            {/* Porcentaje grande */}
            <div className="bg-[#0a1830] border border-white/10 rounded-xl p-6
                            flex flex-col items-center gap-3">
              <div className="text-white/50 text-xs font-bold uppercase tracking-wider">
                {actividadSeleccionada?.icono} {actividadSeleccionada?.nombre}
              </div>
              <div className="text-7xl font-bold" style={{ color: colorPct }}>
                {pct}%
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                     style={{ width: `${pct}%`, background: colorPct }} />
              </div>
              <div className="text-white/40 text-sm">
                {miData?.presentes || 0} de {data.resumen.diasUnicos} días registrados
              </div>
              <div className="text-white/30 text-xs">
                {desde} al {hasta}
              </div>
            </div>

            {/* Desglose por estado */}
            {miData && Object.keys(miData.porEstado).length > 0 && (
              <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
                  Desglose
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(miData.porEstado).map(([estado, cant]) => (
                    <div key={estado}
                         className="flex items-center justify-between gap-3">
                      <span className="text-white/70 text-sm">{estado}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-white/10 w-28 overflow-hidden">
                          <div className="h-full rounded-full bg-[#b01e1e]"
                               style={{
                                 width: `${(cant / (miData.total || 1)) * 100}%`
                               }} />
                        </div>
                        <span className="text-white font-bold text-sm w-5 text-right">
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
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  Historial ({data.registros.length} registros)
                </div>
                {data.registros.map(r => (
                  <div key={r.id}
                       className="bg-[#0a1830] border border-white/10 rounded-xl
                                  px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white/70 text-sm">{r.fecha}</div>
                      <div className="text-white/40 text-xs mt-0.5">
                        {r.hora_ingreso?.substring(0, 5)}
                        {r.guardia && ` · ${r.guardia}`}
                        {r.observaciones && ` · ${r.observaciones}`}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
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
              <div className="text-center text-white/40 text-sm py-8 bg-white/4
                              border border-white/8 rounded-xl">
                Sin registros en este período
              </div>
            )}

          </div>
        )}
      </div>
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
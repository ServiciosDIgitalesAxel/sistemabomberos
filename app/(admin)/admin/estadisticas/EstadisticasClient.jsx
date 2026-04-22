'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EstadisticasClient({
  session, actividades, guardias, usuarios
}) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    actividadId: '',
    guardiaId:   '',
    usuarioId:   '',
    desde:       new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    hasta:       new Date().toISOString().split('T')[0],
  })
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vista, setVista] = useState('resumen') // resumen | detalle | bomberos

  async function buscar() {
    if (!filtros.actividadId) { setError('Seleccioná una actividad'); return }
    if (!filtros.desde || !filtros.hasta) { setError('Seleccioná el rango de fechas'); return }
    setLoading(true)
    setError('')
    setResultados(null)

    try {
      const params = new URLSearchParams({
        actividadId: filtros.actividadId,
        desde:       filtros.desde,
        hasta:       filtros.hasta,
        ...(filtros.guardiaId  && { guardiaId:  filtros.guardiaId }),
        ...(filtros.usuarioId  && { usuarioId:  filtros.usuarioId }),
      })

      const res = await fetch(`/api/admin/estadisticas?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResultados(data)

    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  function setFiltro(key, val) {
    setFiltros(f => ({ ...f, [key]: val }))
    setResultados(null)
  }

  const actividadSeleccionada = actividades.find(a => a.id === filtros.actividadId)

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      {/* Header */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/home')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Estadísticas</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">

        {/* Filtros */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
            Filtros
          </div>

          {/* Actividad */}
          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs">Actividad *</label>
            <select
              value={filtros.actividadId}
              onChange={e => setFiltro('actividadId', e.target.value)}
              className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                         text-white text-sm focus:outline-none focus:border-white/30"
            >
              <option value="">Seleccioná una actividad</option>
              {actividades.map(a => (
                <option key={a.id} value={a.id}>
                  {a.icono} {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Guardia */}
          {guardias.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Guardia (opcional)</label>
              <select
                value={filtros.guardiaId}
                onChange={e => setFiltro('guardiaId', e.target.value)}
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-white/30"
              >
                <option value="">Todas las guardias</option>
                {guardias.map(g => (
                  <option key={g.id} value={g.id}>🚒 {g.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Usuario */}
          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs">Bombero (opcional)</label>
            <select
              value={filtros.usuarioId}
              onChange={e => setFiltro('usuarioId', e.target.value)}
              className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                         text-white text-sm focus:outline-none focus:border-white/30"
            >
              <option value="">Todos los bomberos</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.jerarquia ? `· ${u.jerarquia}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Desde</label>
              <input
                type="date"
                value={filtros.desde}
                onChange={e => setFiltro('desde', e.target.value)}
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Hasta</label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={e => setFiltro('hasta', e.target.value)}
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg
                            px-3 py-2 text-red-300 text-xs">
              {error}
            </div>
          )}

          <button
            onClick={buscar}
            disabled={loading}
            className="w-full bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                       text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
        </div>

        {/* Resultados */}
        {resultados && (
          <div className="flex flex-col gap-4">

            {/* Resumen general */}
            <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{actividadSeleccionada?.icono}</span>
                <div>
                  <div className="text-white font-bold">{actividadSeleccionada?.nombre}</div>
                  <div className="text-white/40 text-xs">
                    {filtros.desde} al {filtros.hasta}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBox
                  numero={resultados.resumen.total}
                  label="Total registros"
                  color="#3b6ec8"
                />
                <StatBox
                  numero={resultados.resumen.diasUnicos}
                  label="Días distintos"
                  color="#c98000"
                />
                <StatBox
                  numero={resultados.resumen.porEstado?.Presente || 0}
                  label="Presentes"
                  color="#1a7a46"
                />
                <StatBox
                  numero={resultados.resumen.total - (resultados.resumen.porEstado?.Presente || 0)}
                  label="Otros estados"
                  color="#b01e1e"
                />
              </div>

              {/* Desglose por estado */}
              {Object.keys(resultados.resumen.porEstado || {}).length > 0 && (
                <div className="border-t border-white/8 pt-3">
                  <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                    Por estado
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(resultados.resumen.porEstado).map(([estado, cant]) => (
                      <div key={estado}
                           className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">{estado}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full bg-white/10 w-24 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#b01e1e]"
                              style={{
                                width: `${(cant / resultados.resumen.total) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-white font-bold text-sm w-6 text-right">
                            {cant}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {['resumen', 'bomberos', 'detalle'].map(v => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase
                              tracking-wide transition-all ${
                    vista === v
                      ? 'bg-[#b01e1e] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {v === 'resumen' ? '📊 Resumen' :
                   v === 'bomberos' ? '👥 Bomberos' : '📋 Detalle'}
                </button>
              ))}
            </div>

            {/* Vista bomberos */}
            {vista === 'bomberos' && (
              <div className="flex flex-col gap-3">
                {resultados.porBombero.length === 0 && (
                  <div className="text-center text-white/40 text-sm py-8">
                    Sin registros
                  </div>
                )}
                {resultados.porBombero.map(b => {
                  const pct = resultados.resumen.diasUnicos > 0
                    ? Math.round((b.presentes / resultados.resumen.diasUnicos) * 100)
                    : 0
                  const color = pct >= 80 ? '#1a7a46' : pct >= 60 ? '#c98000' : '#b01e1e'

                  return (
                    <div key={b.userId}
                         className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-white font-semibold text-sm">{b.nombre}</div>
                          <div className="text-white/40 text-xs">{b.jerarquia}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg" style={{ color }}>
                            {pct}%
                          </div>
                          <div className="text-white/40 text-xs">
                            {b.presentes}/{resultados.resumen.diasUnicos}
                          </div>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      {Object.keys(b.porEstado).length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(b.porEstado).map(([estado, cant]) => (
                            <span key={estado}
                                  className="text-xs bg-white/8 text-white/60
                                             px-2 py-0.5 rounded-full">
                              {estado}: {cant}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Vista detalle */}
            {vista === 'detalle' && (
              <div className="flex flex-col gap-2">
                {resultados.registros.length === 0 && (
                  <div className="text-center text-white/40 text-sm py-8">
                    Sin registros
                  </div>
                )}
                {resultados.registros.map(r => (
                  <div key={r.id}
                       className="bg-[#0a1830] border border-white/10 rounded-xl
                                  px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold">{r.nombre}</div>
                      <div className="text-white/40 text-xs mt-0.5">
                        {r.fecha} · {r.hora_ingreso?.substring(0,5)}
                        {r.guardia && ` · ${r.guardia}`}
                      </div>
                      {r.observaciones && (
                        <div className="text-white/30 text-xs mt-0.5 truncate">
                          {r.observaciones}
                        </div>
                      )}
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

          </div>
        )}

      </div>
    </div>
  )
}

function StatBox({ numero, label, color }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
      <div className="text-2xl font-bold" style={{ color }}>{numero}</div>
      <div className="text-white/40 text-xs mt-1">{label}</div>
    </div>
  )
}
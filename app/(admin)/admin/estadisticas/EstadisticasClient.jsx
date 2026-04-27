'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function EstadisticasClient({ session, actividades, guardias, usuarios }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    actividadId: '',
    guardiaId:   '',
    usuarioId:   '',
    desde: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  })
  const [resultados, setResultados] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vista, setVista] = useState('resumen')

  const actividadSeleccionada = actividades.find(a => a.id === filtros.actividadId)

  async function buscar() {
    if (!filtros.actividadId) { setError('Seleccioná una actividad'); return }
    setLoading(true); setError(''); setResultados(null)
    try {
      const params = new URLSearchParams({
        actividadId: filtros.actividadId,
        desde: filtros.desde,
        hasta: filtros.hasta,
        ...(filtros.guardiaId && { guardiaId: filtros.guardiaId }),
        ...(filtros.usuarioId && { usuarioId: filtros.usuarioId }),
      })
      const res = await fetch(`/api/admin/estadisticas?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResultados(data)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  function setFiltro(key, val) {
    setFiltros(f => ({ ...f, [key]: val }))
    setResultados(null)
  }

  return (
    <PageShell title="Estadísticas" subtitle={session.org_nombre}>

      {/* Filtros */}
      <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                      flex flex-col gap-3 mb-6">
        <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
          Filtros
        </div>

        <Field label="Actividad *">
          <select value={filtros.actividadId}
                  onChange={e => setFiltro('actividadId', e.target.value)}
                  className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                             px-3 py-2.5 text-white text-sm focus:outline-none">
            <option value="">Seleccioná una actividad</option>
            {actividades.map(a => (
              <option key={a.id} value={a.id}>{a.icono} {a.nombre}</option>
            ))}
          </select>
        </Field>

        {guardias.length > 0 && (
          <Field label="Guardia (opcional)">
            <select value={filtros.guardiaId}
                    onChange={e => setFiltro('guardiaId', e.target.value)}
                    className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                               px-3 py-2.5 text-white text-sm focus:outline-none">
              <option value="">Todas las guardias</option>
              {guardias.map(g => (
                <option key={g.id} value={g.id}>🚒 {g.nombre}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Bombero (opcional)">
          <select value={filtros.usuarioId}
                  onChange={e => setFiltro('usuarioId', e.target.value)}
                  className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                             px-3 py-2.5 text-white text-sm focus:outline-none">
            <option value="">Todos los bomberos</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre}{u.jerarquia ? ` · ${u.jerarquia}` : ''}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde">
            <input type="date" value={filtros.desde}
                   onChange={e => setFiltro('desde', e.target.value)}
                   className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                              px-3 py-2.5 text-white text-sm focus:outline-none" />
          </Field>
          <Field label="Hasta">
            <input type="date" value={filtros.hasta}
                   onChange={e => setFiltro('hasta', e.target.value)}
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
          {loading ? '⏳ Buscando...' : '🔍 Buscar'}
        </button>
      </div>

      {/* Resultados */}
      {resultados && (
        <div className="flex flex-col gap-4">

          {/* Resumen */}
          <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{actividadSeleccionada?.icono}</span>
              <div>
                <div className="text-white font-medium">{actividadSeleccionada?.nombre}</div>
                <div className="text-white/30 text-xs">
                  {filtros.desde} al {filtros.hasta}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBox numero={resultados.resumen.total}       label="Total registros" color="#3b6ec8" />
              <StatBox numero={resultados.resumen.diasUnicos}  label="Días distintos"  color="#c98000" />
              <StatBox numero={resultados.resumen.porEstado?.Presente || 0}
                       label="Presentes" color="#1a7a46" />
              <StatBox numero={resultados.resumen.total - (resultados.resumen.porEstado?.Presente || 0)}
                       label="Otros estados" color="#b01e1e" />
            </div>
            {Object.keys(resultados.resumen.porEstado || {}).length > 0 && (
              <div className="border-t border-white/6 pt-3">
                <div className="text-white/30 text-xs font-semibold uppercase
                                tracking-wider mb-2">Por estado</div>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(resultados.resumen.porEstado).map(([estado, cant]) => (
                    <div key={estado} className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">{estado}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-white/8 w-24 overflow-hidden">
                          <div className="h-full rounded-full bg-red-700"
                               style={{ width: `${(cant / resultados.resumen.total) * 100}%` }} />
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
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['resumen', 'bomberos', 'detalle'].map(v => (
              <button key={v} onClick={() => setVista(v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase
                                  tracking-wide ${
                        vista === v
                          ? 'bg-red-700 text-white'
                          : 'bg-white/6 text-white/40 hover:bg-white/10'
                      }`}>
                {v === 'resumen' ? '📊 Resumen' :
                 v === 'bomberos' ? '👥 Bomberos' : '📋 Detalle'}
              </button>
            ))}
          </div>

          {/* Por bombero */}
          {vista === 'bomberos' && (
            <div className="flex flex-col gap-2">
              {resultados.porBombero.length === 0 && (
                <Empty text="Sin registros" />
              )}
              {resultados.porBombero.map(b => {
                const pct = resultados.resumen.diasUnicos > 0
                  ? Math.round((b.presentes / resultados.resumen.diasUnicos) * 100)
                  : 0
                const color = pct >= 80 ? '#1a7a46' : pct >= 60 ? '#c98000' : '#b01e1e'
                return (
                  <div key={b.userId}
                       className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-medium text-sm">{b.nombre}</div>
                        <div className="text-white/30 text-xs">{b.jerarquia}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color }}>{pct}%</div>
                        <div className="text-white/30 text-xs">
                          {b.presentes}/{resultados.resumen.diasUnicos}
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full"
                           style={{ width: `${pct}%`, background: color }} />
                    </div>
                    {Object.keys(b.porEstado).length > 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(b.porEstado).map(([estado, cant]) => (
                          <span key={estado}
                                className="text-xs bg-white/6 text-white/50
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

          {/* Detalle */}
          {vista === 'detalle' && (
            <div className="flex flex-col gap-2">
              {resultados.registros.length === 0 && <Empty text="Sin registros" />}
              {resultados.registros.map(r => (
                <div key={r.id}
                     className="bg-[#0a1830] border border-white/8 rounded-xl
                                px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 text-sm font-medium">{r.nombre}</div>
                    <div className="text-white/30 text-xs mt-0.5">
                      {r.fecha} · {r.hora_ingreso?.substring(0, 5)}
                      {r.guardia && ` · ${r.guardia}`}
                      {r.observaciones && ` · ${r.observaciones}`}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
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
    </PageShell>
  )
}

function StatBox({ numero, label, color }) {
  return (
    <div className="bg-white/4 border border-white/6 rounded-xl p-3 text-center">
      <div className="text-2xl font-bold" style={{ color }}>{numero}</div>
      <div className="text-white/30 text-xs mt-1">{label}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-xs">{label}</label>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl p-8
                    text-center text-white/30 text-sm">{text}</div>
  )
}
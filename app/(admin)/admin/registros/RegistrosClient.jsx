'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

export default function RegistrosClient({ session, actividades }) {
  const router = useRouter()
  const [desde, setDesde] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  )
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])
  const [actividadId, setActividadId] = useState('')
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  const actividadSeleccionada = actividades.find(a => a.id === actividadId)

  async function buscar() {
    if (!desde || !hasta) { setError('Seleccioná las fechas'); return }
    setLoading(true)
    setError('')
    setMsg('')
    try {
      const params = new URLSearchParams({ desde, hasta })
      if (actividadId) params.append('actividadId', actividadId)
      const res = await fetch(`/api/admin/registros?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setRegistros(data.registros || [])
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  function abrirEdicion(r) {
    setEditando(r.id)
    setEditForm({
      estado:        r.estado,
      observaciones: r.observaciones || '',
      fecha:         r.fecha,
      hora_ingreso:  r.hora_ingreso?.substring(0, 5) || '',
      hora_egreso:   r.hora_egreso?.substring(0, 5) || '',
    })
  }

  async function guardarEdicion(id) {
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/registros', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setRegistros(prev => prev.map(r =>
        r.id === id ? { ...r, ...editForm } : r
      ))
      setEditando(null)
      setMsg('✅ Registro actualizado')
    } catch {
      setError('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return
    const res = await fetch('/api/admin/registros', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setRegistros(prev => prev.filter(r => r.id !== id))
      setMsg('🗑️ Registro eliminado')
    }
  }

  function exportarExcel() {
    if (registros.length === 0) { setError('No hay datos para exportar'); return }

    const filas = registros.map(r => ({
      'Nombre':       r.user?.nombre || '',
      'Jerarquía':    r.user?.jerarquia || '',
      'Actividad':    r.activity_types?.nombre || '',
      'Tipo':         r.activity_types?.tipo_base || '',
      'Guardia':      r.guards?.nombre || '',
      'Fecha':        r.fecha,
      'Hora Ingreso': r.hora_ingreso?.substring(0, 5) || '',
      'Hora Egreso':  r.hora_egreso?.substring(0, 5) || '',
      'Tiempo Total': r.tiempo_total || '',
      'Estado':       r.estado,
      'Observaciones':r.observaciones || '',
    }))

    const ws = XLSX.utils.json_to_sheet(filas)
    const wb = XLSX.utils.book_new()

    // Ancho de columnas
    ws['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 20 }, { wch: 30 },
    ]

    const nombreHoja = actividadSeleccionada?.nombre || 'Registros'
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja.substring(0, 31))

    const nombreArchivo = `${session.org_nombre}_${nombreHoja}_${desde}_${hasta}.xlsx`
      .replace(/[^a-zA-Z0-9._-]/g, '_')

    XLSX.writeFile(wb, nombreArchivo)
    setMsg(`✅ Archivo "${nombreArchivo}" descargado`)
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 lg:hidden">
        <button onClick={() => router.push('/home')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Registros y Exportación</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 max-w-4xl mx-auto w-full">

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl
                          px-4 py-3 text-red-300 text-sm">{error}</div>
        )}
        {msg && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                          px-4 py-3 text-green-300 text-sm">{msg}</div>
        )}

        {/* Filtros */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Filtros</div>

          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs">Tipo de actividad</label>
            <select value={actividadId} onChange={e => setActividadId(e.target.value)}
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white text-sm focus:outline-none">
              <option value="">Todas las actividades</option>
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

          <div className="flex gap-2">
            <button onClick={buscar} disabled={loading}
                    className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                               text-white font-bold py-3 rounded-xl transition-all">
              {loading ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
            {registros.length > 0 && (
              <button onClick={exportarExcel}
                      className="flex-1 bg-[#1a7a46] hover:bg-[#1d9e57]
                                 text-white font-bold py-3 rounded-xl transition-all">
                📥 Exportar Excel
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        {registros.length > 0 && (
          <>
            <div className="text-white/40 text-xs font-bold uppercase tracking-wider">
              {registros.length} registro{registros.length !== 1 ? 's' : ''}
            </div>

            <div className="flex flex-col gap-2">
              {registros.map(r => (
                <div key={r.id}
                     className="bg-[#0a1830] border border-white/10 rounded-xl p-4">

                  {editando === r.id ? (
                    // Formulario de edición
                    <div className="flex flex-col gap-3">
                      <div className="text-white font-bold text-sm mb-1">
                        ✏️ Editando: {r.user?.nombre}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-white/50 text-xs">Estado</label>
                          <select value={editForm.estado}
                                  onChange={e => setEditForm({...editForm, estado: e.target.value})}
                                  className="bg-white/8 border border-white/10 rounded-lg
                                             px-2 py-2 text-white text-sm focus:outline-none">
                            {(actividadSeleccionada?.estados || ['Presente','Ausente Justificado']).map(e => (
                              <option key={e} value={e}>{e}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-white/50 text-xs">Fecha</label>
                          <input type="date" value={editForm.fecha}
                                 onChange={e => setEditForm({...editForm, fecha: e.target.value})}
                                 className="bg-white/8 border border-white/10 rounded-lg
                                            px-2 py-2 text-white text-sm focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-white/50 text-xs">Hora ingreso</label>
                          <input type="time" value={editForm.hora_ingreso}
                                 onChange={e => setEditForm({...editForm, hora_ingreso: e.target.value})}
                                 className="bg-white/8 border border-white/10 rounded-lg
                                            px-2 py-2 text-white text-sm focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-white/50 text-xs">Hora egreso</label>
                          <input type="time" value={editForm.hora_egreso}
                                 onChange={e => setEditForm({...editForm, hora_egreso: e.target.value})}
                                 className="bg-white/8 border border-white/10 rounded-lg
                                            px-2 py-2 text-white text-sm focus:outline-none" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-white/50 text-xs">Observaciones</label>
                        <input type="text" value={editForm.observaciones}
                               onChange={e => setEditForm({...editForm, observaciones: e.target.value})}
                               className="bg-white/8 border border-white/10 rounded-lg
                                          px-3 py-2 text-white text-sm focus:outline-none" />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => guardarEdicion(r.id)} disabled={guardando}
                                className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                                           text-white font-bold py-2.5 rounded-xl text-sm">
                          {guardando ? '⏳...' : '✅ Guardar'}
                        </button>
                        <button onClick={() => setEditando(null)}
                                className="flex-1 bg-white/8 border border-white/10
                                           text-white/70 font-bold py-2.5 rounded-xl text-sm">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Vista normal
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">
                            {r.user?.nombre}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            r.estado === 'Presente'
                              ? 'bg-green-900/40 text-green-400'
                              : r.estado === 'Ausente Justificado'
                              ? 'bg-red-900/40 text-red-400'
                              : 'bg-yellow-900/40 text-yellow-400'
                          }`}>
                            {r.estado}
                          </span>
                        </div>
                        <div className="text-white/40 text-xs mt-1">
                          {r.activity_types?.icono} {r.activity_types?.nombre} ·{' '}
                          {r.fecha} · {r.hora_ingreso?.substring(0,5)}
                          {r.guards && ` · ${r.guards.nombre}`}
                        </div>
                        {r.observaciones && (
                          <div className="text-white/30 text-xs mt-1 truncate">
                            {r.observaciones}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => abrirEdicion(r)}
                                className="bg-white/8 hover:bg-white/15 border border-white/10
                                           text-white/70 text-xs px-2.5 py-1.5 rounded-lg">
                          ✏️
                        </button>
                        {['admin','superadmin'].includes(session.rol) && (
                          <button onClick={() => eliminar(r.id)}
                                  className="bg-red-900/20 hover:bg-red-900/40 border border-red-500/20
                                             text-red-400 text-xs px-2.5 py-1.5 rounded-lg">
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && registros.length === 0 && (
          <div className="text-center text-white/40 text-sm py-8">
            Usá los filtros para buscar registros
          </div>
        )}

      </div>
    </div>
  )
}
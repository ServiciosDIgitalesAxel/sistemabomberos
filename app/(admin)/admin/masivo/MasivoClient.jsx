'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function MasivoClient({
  session, usuarios, actividades, guardias
}) {
  const router = useRouter()
  const [actividadId, setActividadId] = useState('')
  const [guardiaId,   setGuardiaId]   = useState('')
  const [fecha,       setFecha]       = useState(
    new Date().toISOString().split('T')[0]
  )
  const [seleccionados, setSeleccionados] = useState({})
  const [buscar,        setBuscar]        = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState('')

  const actividad = actividades.find(a => a.id === actividadId)
  const estados   = actividad?.estados || ['Presente', 'Ausente Justificado']

  const usuariosFiltrados = useMemo(() => {
    let lista = usuarios
    if (guardiaId) {
      lista = lista.filter(u =>
        u.user_guards?.some(ug => ug.guard_id === guardiaId)
      )
    }
    if (buscar) {
      const q = buscar.toLowerCase()
      lista = lista.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        (u.jerarquia || '').toLowerCase().includes(q)
      )
    }
    return lista
  }, [usuarios, guardiaId, buscar])

  function toggleUsuario(userId, estado) {
    setSeleccionados(prev => {
      if (!estado) {
        const next = { ...prev }
        delete next[userId]
        return next
      }
      return { ...prev, [userId]: { estado, observaciones: '' } }
    })
  }

  function setEstado(userId, estado) {
    setSeleccionados(prev => ({
      ...prev,
      [userId]: { ...prev[userId], estado }
    }))
  }

  function setObs(userId, observaciones) {
    setSeleccionados(prev => ({
      ...prev,
      [userId]: { ...prev[userId], observaciones }
    }))
  }

  function seleccionarTodos() {
    const nuevos = {}
    usuariosFiltrados.forEach(u => {
      nuevos[u.id] = { estado: estados[0], observaciones: '' }
    })
    setSeleccionados(nuevos)
  }

  function deseleccionarTodos() {
    setSeleccionados({})
  }

  async function handleRegistrar() {
    if (!actividadId) { setError('Seleccioná una actividad'); return }
    if (!fecha)       { setError('Seleccioná una fecha'); return }
    const registros = Object.entries(seleccionados).map(([user_id, data]) => ({
      user_id, ...data
    }))
    if (registros.length === 0) { setError('Seleccioná al menos un bombero'); return }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registros,
          activity_type_id: actividadId,
          guard_id: guardiaId || null,
          fecha
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(data.message)
      setSeleccionados({})
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const cantSeleccionados = Object.keys(seleccionados).length

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      {/* Header */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 lg:hidden">
        <button onClick={() => router.push('/home')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Registro Masivo</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl
                          px-4 py-3 text-red-300 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                          px-4 py-3 text-green-300 text-sm">{success}</div>
        )}

        {/* Configuración */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4
                        flex flex-col gap-3">

          <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
            Configuración
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs">Actividad *</label>
            <select
              value={actividadId}
              onChange={e => { setActividadId(e.target.value); setSeleccionados({}) }}
              className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                         text-white text-sm focus:outline-none"
            >
              <option value="">Seleccioná actividad</option>
              {actividades.map(a => (
                <option key={a.id} value={a.id}>{a.icono} {a.nombre}</option>
              ))}
            </select>
          </div>

          {guardias.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Guardia (filtra la lista)</label>
              <select
                value={guardiaId}
                onChange={e => setGuardiaId(e.target.value)}
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm focus:outline-none"
              >
                <option value="">Todos</option>
                {guardias.map(g => (
                  <option key={g.id} value={g.id}>🚒 {g.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                         text-white text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Lista bomberos */}
        {actividadId && (
          <>
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                placeholder="🔍 Buscar bombero..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl
                           px-4 py-2.5 text-white placeholder-white/30 text-sm
                           focus:outline-none focus:border-white/20"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={seleccionarTodos}
                      className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                                 text-white/70 text-xs font-bold py-2 rounded-lg">
                ✅ Todos
              </button>
              <button onClick={deseleccionarTodos}
                      className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                                 text-white/70 text-xs font-bold py-2 rounded-lg">
                ✕ Ninguno
              </button>
            </div>

            <div className="text-white/40 text-xs font-bold uppercase tracking-wider">
              {usuariosFiltrados.length} bombero{usuariosFiltrados.length !== 1 ? 's' : ''}
              {cantSeleccionados > 0 && ` · ${cantSeleccionados} seleccionado${cantSeleccionados !== 1 ? 's' : ''}`}
            </div>

            <div className="flex flex-col gap-2">
              {usuariosFiltrados.map(u => {
                const sel = seleccionados[u.id]
                const guardiaUsuario = u.user_guards
                  ?.map(ug => ug.guards?.nombre)
                  .filter(Boolean).join(', ')

                return (
                  <div key={u.id}
                       className={`rounded-xl border p-3 transition-all ${
                         sel
                           ? 'bg-[#0e2245] border-[#2353a4]'
                           : 'bg-[#0a1830] border-white/8'
                       }`}>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!sel}
                        onChange={e => toggleUsuario(
                          u.id, e.target.checked ? estados[0] : null
                        )}
                        className="accent-red-500 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold">{u.nombre}</div>
                        <div className="text-white/40 text-xs">
                          {u.jerarquia}
                          {guardiaUsuario && ` · ${guardiaUsuario}`}
                        </div>
                      </div>
                    </div>

                    {sel && (
                      <div className="mt-2 ml-7 flex flex-col gap-2">
                        <select
                          value={sel.estado}
                          onChange={e => setEstado(u.id, e.target.value)}
                          className="bg-white/8 border border-white/10 rounded-lg
                                     px-3 py-2 text-white text-sm focus:outline-none"
                        >
                          {estados.map(e => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={sel.observaciones}
                          onChange={e => setObs(u.id, e.target.value)}
                          placeholder="Observación (opcional)"
                          className="bg-white/8 border border-white/10 rounded-lg
                                     px-3 py-2 text-white placeholder-white/30
                                     text-sm focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Botón registrar */}
            <button
              onClick={handleRegistrar}
              disabled={loading || cantSeleccionados === 0}
              className="w-full bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                         text-white font-bold py-4 rounded-xl transition-all
                         shadow-lg text-base sticky bottom-4"
            >
              {loading
                ? '⏳ Registrando...'
                : `✅ REGISTRAR ${cantSeleccionados > 0 ? cantSeleccionados : ''} BOMBERO${cantSeleccionados !== 1 ? 'S' : ''}`
              }
            </button>

          </>
        )}

      </div>
    </div>
  )
}
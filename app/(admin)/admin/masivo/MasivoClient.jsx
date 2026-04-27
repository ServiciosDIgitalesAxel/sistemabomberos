'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function MasivoClient({ session, usuarios, actividades, guardias }) {
  const router = useRouter()
  const [actividadId, setActividadId] = useState('')
  const [guardiaId,   setGuardiaId]   = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [seleccionados, setSeleccionados] = useState({})
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const actividad = actividades.find(a => a.id === actividadId)
  const estados   = actividad?.estados || ['Presente', 'Ausente Justificado']

  const usuariosFiltrados = useMemo(() => {
    let lista = usuarios
    if (guardiaId) lista = lista.filter(u =>
      u.user_guards?.some(ug => ug.guard_id === guardiaId)
    )
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
      if (!estado) { const next = { ...prev }; delete next[userId]; return next }
      return { ...prev, [userId]: { estado, observaciones: '' } }
    })
  }

  function setEstado(userId, estado) {
    setSeleccionados(prev => ({ ...prev, [userId]: { ...prev[userId], estado } }))
  }

  function setObs(userId, observaciones) {
    setSeleccionados(prev => ({ ...prev, [userId]: { ...prev[userId], observaciones } }))
  }

  function seleccionarTodos() {
    const nuevos = {}
    usuariosFiltrados.forEach(u => {
      nuevos[u.id] = { estado: estados[0], observaciones: '' }
    })
    setSeleccionados(nuevos)
  }

  async function handleRegistrar() {
    if (!actividadId) { setError('Seleccioná una actividad'); return }
    if (!fecha)       { setError('Seleccioná una fecha'); return }
    const registros = Object.entries(seleccionados).map(([user_id, data]) => ({
      user_id, ...data
    }))
    if (registros.length === 0) { setError('Seleccioná al menos un bombero'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/admin/masivo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registros, activity_type_id: actividadId,
          guard_id: guardiaId || null, fecha
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(data.message)
      setSeleccionados({})
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  const cant = Object.keys(seleccionados).length

  return (
    <PageShell title="Registro Masivo" subtitle={session.org_nombre}>

      {error   && <Msg type="error"   text={error} />}
      {success && <Msg type="success" text={success} />}

      {/* Config */}
      <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                      flex flex-col gap-3 mb-4">
        <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
          Configuración
        </div>

        <Field label="Actividad *">
          <select value={actividadId}
                  onChange={e => { setActividadId(e.target.value); setSeleccionados({}) }}
                  className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                             px-3 py-2.5 text-white text-sm focus:outline-none">
            <option value="">Seleccioná actividad</option>
            {actividades.map(a => (
              <option key={a.id} value={a.id}>{a.icono} {a.nombre}</option>
            ))}
          </select>
        </Field>

        {guardias.length > 0 && (
          <Field label="Guardia (filtra la lista)">
            <select value={guardiaId} onChange={e => setGuardiaId(e.target.value)}
                    className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                               px-3 py-2.5 text-white text-sm focus:outline-none">
              <option value="">Todos</option>
              {guardias.map(g => (
                <option key={g.id} value={g.id}>🚒 {g.nombre}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Fecha *">
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                 className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                            px-3 py-2.5 text-white text-sm focus:outline-none" />
        </Field>
      </div>

      {actividadId && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
                   placeholder="🔍 Buscar bombero..."
                   className="flex-1 bg-[#0a1830] border border-white/8 rounded-xl
                              px-4 py-2.5 text-white placeholder-white/25 text-sm
                              focus:outline-none focus:border-white/20" />
          </div>

          <div className="flex gap-2 mb-3">
            <button onClick={seleccionarTodos}
                    className="flex-1 bg-white/6 hover:bg-white/10 border border-white/8
                               text-white/60 text-xs font-medium py-2 rounded-lg">
              ✅ Todos
            </button>
            <button onClick={() => setSeleccionados({})}
                    className="flex-1 bg-white/6 hover:bg-white/10 border border-white/8
                               text-white/60 text-xs font-medium py-2 rounded-lg">
              ✕ Ninguno
            </button>
          </div>

          <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">
            {usuariosFiltrados.length} bombero{usuariosFiltrados.length !== 1 ? 's' : ''}
            {cant > 0 && ` · ${cant} seleccionado${cant !== 1 ? 's' : ''}`}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {usuariosFiltrados.map(u => {
              const sel = seleccionados[u.id]
              const guardiaNombre = u.user_guards
                ?.map(ug => ug.guards?.nombre).filter(Boolean).join(', ')
              return (
                <div key={u.id}
                     className={`rounded-xl border p-3 ${
                       sel
                         ? 'bg-[#0e2245] border-blue-500/20'
                         : 'bg-[#0a1830] border-white/8'
                     }`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={!!sel}
                           onChange={e => toggleUsuario(
                             u.id, e.target.checked ? estados[0] : null
                           )}
                           className="accent-red-600 w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{u.nombre}</div>
                      <div className="text-white/30 text-xs">
                        {u.jerarquia}{guardiaNombre && ` · ${guardiaNombre}`}
                      </div>
                    </div>
                  </div>
                  {sel && (
                    <div className="mt-2 ml-7 flex flex-col gap-2">
                      <select value={sel.estado} onChange={e => setEstado(u.id, e.target.value)}
                              className="bg-[#0d1f38] border border-white/10 rounded-lg
                                         px-3 py-2 text-white text-sm focus:outline-none">
                        {estados.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                      <input type="text" value={sel.observaciones}
                             onChange={e => setObs(u.id, e.target.value)}
                             placeholder="Observación (opcional)"
                             className="bg-[#0d1f38] border border-white/10 rounded-lg
                                        px-3 py-2 text-white placeholder-white/25
                                        text-sm focus:outline-none" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={handleRegistrar} disabled={loading || cant === 0}
                  className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                             text-white font-semibold py-3.5 rounded-xl text-sm
                             sticky bottom-4">
            {loading
              ? 'Registrando...'
              : `✓ Registrar ${cant > 0 ? cant : ''} bombero${cant !== 1 ? 's' : ''}`
            }
          </button>
        </>
      )}
    </PageShell>
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

function Msg({ type, text }) {
  const s = type === 'error'
    ? 'bg-red-900/20 border-red-500/20 text-red-400'
    : 'bg-green-900/20 border-green-500/20 text-green-400'
  return <div className={`border rounded-xl px-4 py-3 text-sm mb-4 ${s}`}>{text}</div>
}
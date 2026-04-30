'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function GuardiasClient({ guardias: inicial, session }) {
  const router = useRouter()
  const [guardias, setGuardias] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function abrirCrear() {
    setNombre(''); setEditando(null); setShowForm(true); setError('')
  }

  function abrirEditar(g) {
    setNombre(g.nombre); setEditando(g); setShowForm(true); setError('')
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true); setError('')
    try {
      const method = editando ? 'PATCH' : 'POST'
      const body   = editando ? { id: editando.id, nombre } : { nombre }
      const res = await fetch('/api/admin/guardias', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(editando ? '✅ Guardia actualizada' : '✅ Guardia creada')
      setShowForm(false); setNombre(''); setEditando(null)
      const res2 = await fetch('/api/admin/guardias')
      const data2 = await res2.json()
      if (data2.guardias) setGuardias(data2.guardias)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  async function toggleActiva(g) {
    const res = await fetch('/api/admin/guardias', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: g.id, activa: !g.activa })
    })
    if (res.ok) setGuardias(prev => prev.map(x =>
      x.id === g.id ? { ...x, activa: !x.activa } : x
    ))
  }

  return (
    <PageShell
      title="Gestión de Guardias"
      subtitle={session.org_nombre}
      actions={
  <button onClick={abrirCrear}
          className="w-full lg:w-auto bg-red-700 hover:bg-red-800
                     text-white text-sm font-medium px-4 py-2.5 rounded-lg">
    + Nuevo usuario
  </button>
}
    >
      {error && <Msg type="error" text={error} />}
      {success && <Msg type="success" text={success} />}

      {showForm && (
        <form onSubmit={handleGuardar}
              className="bg-[#0a1830] border border-white/8 rounded-xl p-5
                         flex flex-col gap-4 mb-6">
          <h3 className="text-white font-semibold">
            {editando ? `✏️ Editar: ${editando.nombre}` : '➕ Nueva Guardia'}
          </h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                   required placeholder="Ej: Guardia 1, Los Tigres..."
                   className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                              text-white placeholder-white/25 text-sm
                              focus:outline-none focus:border-white/25" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
                    className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50
                               text-white font-semibold py-3 rounded-xl text-sm">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                               text-white/60 font-medium py-3 rounded-xl text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">
        {guardias.length} guardia{guardias.length !== 1 ? 's' : ''}
      </div>

      <div className="flex flex-col gap-2">
        {guardias.map(g => {
          const miembros = g.user_guards?.map(ug => ug.users).filter(Boolean) || []
          return (
            <div key={g.id}
                 className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">
                      🚒 {g.nombre}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      g.activa
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-red-900/40 text-red-400'
                    }`}>
                      {g.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">
                    {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEditar(g)}
                          className="bg-white/8 hover:bg-white/12 border border-white/8
                                     text-white/60 text-xs px-3 py-1.5 rounded-lg">
                    ✏️
                  </button>
                  <button onClick={() => toggleActiva(g)}
                          className={`text-xs px-3 py-1.5 rounded-lg border ${
                            g.activa
                              ? 'bg-red-900/20 border-red-500/20 text-red-400'
                              : 'bg-green-900/20 border-green-500/20 text-green-400'
                          }`}>
                    {g.activa ? '⛔' : '✅'}
                  </button>
                </div>
              </div>
              {miembros.length > 0 && (
                <div className="border-t border-white/6 pt-2 flex flex-wrap gap-1.5">
                  {miembros.map(m => (
                    <span key={m.id}
                          className="bg-white/6 text-white/50 text-xs px-2 py-0.5 rounded-lg">
                      {m.nombre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {guardias.length === 0 && <Empty text="No hay guardias creadas todavía" />}
      </div>
    </PageShell>
  )
}

function Msg({ type, text }) {
  const s = type === 'error'
    ? 'bg-red-900/20 border-red-500/20 text-red-400'
    : 'bg-green-900/20 border-green-500/20 text-green-400'
  return <div className={`border rounded-xl px-4 py-3 text-sm mb-4 ${s}`}>{text}</div>
}

function Empty({ text }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl p-8
                    text-center text-white/30 text-sm">{text}</div>
  )
}
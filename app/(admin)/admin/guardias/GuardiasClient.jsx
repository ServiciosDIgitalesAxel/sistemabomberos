'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    setNombre('')
    setEditando(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function abrirEditar(g) {
    setNombre(g.nombre)
    setEditando(g)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError('')

    try {
      const method = editando ? 'PATCH' : 'POST'
      const body = editando
        ? { id: editando.id, nombre }
        : { nombre }

      const res = await fetch('/api/admin/guardias', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error); return }

      setSuccess(editando ? '✅ Guardia actualizada' : '✅ Guardia creada')
      setShowForm(false)
      setNombre('')
      setEditando(null)

      // Recargar
      const res2 = await fetch('/api/admin/guardias')
      const data2 = await res2.json()
      if (data2.guardias) setGuardias(data2.guardias)

    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActiva(g) {
    const res = await fetch('/api/admin/guardias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: g.id, activa: !g.activa })
    })
    if (res.ok) {
      setGuardias(prev => prev.map(x =>
        x.id === g.id ? { ...x, activa: !x.activa } : x
      ))
    }
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      {/* Header */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 lg:hidden">
        <button
          onClick={() => router.push('/home')}
          className="bg-white/10 hover:bg-white/20 border border-white/20
                     text-white text-xs font-semibold px-3 py-2 rounded-lg"
        >
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Gestión de Guardias</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-white/15 hover:bg-white/25 border border-white/20
                     text-white text-xs font-bold px-3 py-2 rounded-lg"
        >
          + Nueva
        </button>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleGuardar}
                className="bg-[#0a1830] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg">
              {editando ? `✏️ Editar: ${editando.nombre}` : '➕ Nueva Guardia'}
            </h3>
            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Nombre de la Guardia *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                placeholder="Ej: Guardia 1, Los Tigres, Turno Mañana..."
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white placeholder-white/30 text-sm
                           focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                      className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                                 text-white font-bold py-3 rounded-xl transition-all">
                {loading ? '⏳ Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                                 text-white/70 font-bold py-3 rounded-xl">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="text-white/40 text-xs font-bold uppercase tracking-wider">
          {guardias.length} guardia{guardias.length !== 1 ? 's' : ''}
        </div>

        <div className="flex flex-col gap-3">
          {guardias.map(g => {
            const miembros = g.user_guards
              ?.map(ug => ug.users)
              .filter(Boolean) || []

            return (
              <div key={g.id}
                   className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-base">
                        🚒 {g.nombre}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        g.activa
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-red-900/40 text-red-400'
                      }`}>
                        {g.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      {miembros.length} miembro{miembros.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditar(g)}
                      className="bg-white/8 hover:bg-white/15 border border-white/10
                                 text-white/70 text-xs px-3 py-1.5 rounded-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => toggleActiva(g)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        g.activa
                          ? 'bg-red-900/20 border-red-500/20 text-red-400 hover:bg-red-900/40'
                          : 'bg-green-900/20 border-green-500/20 text-green-400 hover:bg-green-900/40'
                      }`}
                    >
                      {g.activa ? '⛔' : '✅'}
                    </button>
                  </div>
                </div>

                {/* Miembros */}
                {miembros.length > 0 && (
                  <div className="border-t border-white/8 pt-3 flex flex-wrap gap-2">
                    {miembros.map(m => (
                      <span key={m.id}
                            className="bg-white/8 text-white/60 text-xs px-2 py-1 rounded-lg">
                        {m.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {guardias.length === 0 && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-8
                            text-center text-white/40 text-sm">
              No hay guardias creadas todavía
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
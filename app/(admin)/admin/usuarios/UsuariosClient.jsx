'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ROLES = [
  { value: 'bombero', label: '🚒 Bombero' },
  { value: 'jefe',    label: '👮 Jefe de Guardia' },
  { value: 'admin',   label: '⚙️ Administrador' },
]

const EMPTY_FORM = {
  nombre: '', jerarquia: '', username: '',
  password: '', rol: 'bombero', guardias: []
}

export default function UsuariosClient({ usuarios: inicial, guardias, session }) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [buscar, setBuscar] = useState('')

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    u.username.toLowerCase().includes(buscar.toLowerCase()) ||
    (u.jerarquia || '').toLowerCase().includes(buscar.toLowerCase())
  )

  function abrirCrear() {
    setForm(EMPTY_FORM)
    setEditando(null)
    setShowForm(true)
    setError('')
  }

  function abrirEditar(u) {
    setForm({
      nombre: u.nombre,
      jerarquia: u.jerarquia || '',
      username: u.username,
      password: '',
      rol: u.rol,
      guardias: u.user_guards?.map(ug => ug.guard_id) || []
    })
    setEditando(u)
    setShowForm(true)
    setError('')
  }

  function toggleGuardia(gid) {
    setForm(f => ({
      ...f,
      guardias: f.guardias.includes(gid)
        ? f.guardias.filter(g => g !== gid)
        : [...f.guardias, gid]
    }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const method = editando ? 'PATCH' : 'POST'
      const body = editando
        ? { id: editando.id, ...form }
        : form

      const res = await fetch('/api/admin/usuarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error); return }

      setSuccess(editando ? '✅ Usuario actualizado' : '✅ Usuario creado correctamente')
      setShowForm(false)

      // Recargar lista
      const res2 = await fetch('/api/admin/usuarios')
      const data2 = await res2.json()
      if (data2.usuarios) setUsuarios(data2.usuarios)

    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActivo(u) {
    const res = await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, activo: !u.activo })
    })
    if (res.ok) {
      setUsuarios(prev => prev.map(x =>
        x.id === u.id ? { ...x, activo: !x.activo } : x
      ))
    }
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      {/* Header */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/home')}
          className="bg-white/10 hover:bg-white/20 border border-white/20
                     text-white text-xs font-semibold px-3 py-2 rounded-lg"
        >
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Gestión de Usuarios</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-white/15 hover:bg-white/25 border border-white/20
                     text-white text-xs font-bold px-3 py-2 rounded-lg"
        >
          + Nuevo
        </button>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">

        {/* Mensajes */}
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
              {editando ? `✏️ Editar: ${editando.nombre}` : '➕ Nuevo Usuario'}
            </h3>

            {[
              { label: 'Nombre Completo *', key: 'nombre', placeholder: 'Nombre del bombero', required: true },
              { label: 'Jerarquía', key: 'jerarquia', placeholder: 'Ej: Bombero 1ra' },
              { label: 'Usuario *', key: 'username', placeholder: 'Para iniciar sesión', required: true },
            ].map(field => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  required={field.required}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:border-white/30"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Contraseña {!editando && '*'}
                {editando && <span className="text-white/30 normal-case tracking-normal ml-1">(dejar vacío para mantener)</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required={!editando}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white placeholder-white/30 text-sm
                           focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">Rol *</label>
              <div className="flex flex-col gap-2">
                {ROLES.map(r => (
                  <label key={r.value}
                         className="flex items-center gap-3 bg-white/5 border border-white/10
                                    rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/8">
                    <input
                      type="radio"
                      name="rol"
                      value={r.value}
                      checked={form.rol === r.value}
                      onChange={() => setForm({ ...form, rol: r.value })}
                      className="accent-red-500"
                    />
                    <span className="text-white text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {guardias.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  Guardias Asignadas
                </label>
                <div className="flex flex-col gap-2">
                  {guardias.map(g => (
                    <label key={g.id}
                           className="flex items-center gap-3 bg-white/5 border border-white/10
                                      rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/8">
                      <input
                        type="checkbox"
                        checked={form.guardias.includes(g.id)}
                        onChange={() => toggleGuardia(g.id)}
                        className="accent-red-500"
                      />
                      <span className="text-white text-sm">🚒 {g.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
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

        {/* Buscador */}
        <input
          type="text"
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          placeholder="🔍 Buscar por nombre, usuario o jerarquía..."
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3
                     text-white placeholder-white/30 text-sm
                     focus:outline-none focus:border-white/20"
        />

        {/* Lista */}
        <div className="text-white/40 text-xs font-bold uppercase tracking-wider">
          {filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}
        </div>

        <div className="flex flex-col gap-3">
          {filtrados.map(u => {
            const guardiasNombres = u.user_guards
              ?.map(ug => ug.guards?.nombre)
              .filter(Boolean)
              .join(', ')

            return (
              <div key={u.id}
                   className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{u.nombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        u.activo
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-red-900/40 text-red-400'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="text-white/50 text-xs mt-1">
                      {u.jerarquia && `${u.jerarquia} · `}
                      @{u.username} · {getRolLabel(u.rol)}
                    </div>
                    {guardiasNombres && (
                      <div className="text-white/40 text-xs mt-1">
                        🚒 {guardiasNombres}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="bg-white/8 hover:bg-white/15 border border-white/10
                                 text-white/70 text-xs px-3 py-1.5 rounded-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => toggleActivo(u)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        u.activo
                          ? 'bg-red-900/20 border-red-500/20 text-red-400 hover:bg-red-900/40'
                          : 'bg-green-900/20 border-green-500/20 text-green-400 hover:bg-green-900/40'
                      }`}
                    >
                      {u.activo ? '⛔' : '✅'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtrados.length === 0 && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-8
                            text-center text-white/40 text-sm">
              {buscar ? 'No hay resultados para esa búsqueda' : 'No hay usuarios todavía'}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function getRolLabel(rol) {
  const labels = { admin: '⚙️ Admin', jefe: '👮 Jefe', bombero: '🚒 Bombero' }
  return labels[rol] || rol
}
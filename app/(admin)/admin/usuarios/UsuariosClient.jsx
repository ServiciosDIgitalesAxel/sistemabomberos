'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

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
      nombre:   u.nombre,
      jerarquia:u.jerarquia || '',
      username: u.username,
      password: '',
      rol:      u.rol,
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
      const body   = editando ? { id: editando.id, ...form } : form
      const res = await fetch('/api/admin/usuarios', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(editando ? '✅ Usuario actualizado' : '✅ Usuario creado')
      setShowForm(false)
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
    <PageShell
      title="Gestión de Usuarios"
      subtitle={session.org_nombre}
     actions={
  <button onClick={abrirCrear}
          className="w-full lg:w-auto bg-red-700 hover:bg-red-800
                     text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
    + Nuevo usuario
  </button>
}
    >
      {error && <Msg type="error" text={error} />}
      {success && <Msg type="success" text={success} />}

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleGuardar}
              className="bg-[#0a1830] border border-white/8 rounded-xl p-5
                         flex flex-col gap-4 mb-6">
          <h3 className="text-white font-semibold">
            {editando ? `✏️ Editar: ${editando.nombre}` : '➕ Nuevo Usuario'}
          </h3>

          {[
            { label: 'Nombre Completo', key: 'nombre', placeholder: 'Nombre del bombero', required: true },
            { label: 'Jerarquía',       key: 'jerarquia', placeholder: 'Ej: Bombero 1ra' },
            { label: 'Usuario',         key: 'username',  placeholder: 'Para iniciar sesión', required: true },
          ].map(field => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              <input type="text" value={form[field.key]} autoComplete="off"
                     onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                     required={field.required} placeholder={field.placeholder}
                     className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                                text-white placeholder-white/25 text-sm
                                focus:outline-none focus:border-white/25" />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Contraseña {!editando && <span className="text-red-400">*</span>}
              {editando && <span className="text-white/25 normal-case tracking-normal
                                            font-normal ml-1">(vacío = mantener)</span>}
            </label>
            <input type="password" value={form.password} autoComplete="new-password"
                   onChange={e => setForm({ ...form, password: e.target.value })}
                   required={!editando} placeholder="Mínimo 4 caracteres"
                   className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                              text-white placeholder-white/25 text-sm
                              focus:outline-none focus:border-white/25" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Rol <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {ROLES.map(r => (
                <label key={r.value}
                       className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                                   border cursor-pointer ${
                         form.rol === r.value
                           ? 'border-white/20 bg-white/6'
                           : 'border-white/8 hover:bg-white/4'
                       }`}>
                  <input type="radio" name="rol" value={r.value}
                         checked={form.rol === r.value}
                         onChange={() => setForm({ ...form, rol: r.value })}
                         className="accent-red-600" />
                  <span className="text-white/80 text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {guardias.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                Guardias Asignadas
              </label>
              <div className="flex flex-col gap-2">
                {guardias.map(g => (
                  <label key={g.id}
                         className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                                     border cursor-pointer ${
                           form.guardias.includes(g.id)
                             ? 'border-white/20 bg-white/6'
                             : 'border-white/8 hover:bg-white/4'
                         }`}>
                    <input type="checkbox" checked={form.guardias.includes(g.id)}
                           onChange={() => toggleGuardia(g.id)}
                           className="accent-red-600" />
                    <span className="text-white/80 text-sm">🚒 {g.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
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

      {/* Buscador */}
      <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
             placeholder="🔍 Buscar por nombre, usuario o jerarquía..."
             className="w-full bg-[#0a1830] border border-white/8 rounded-xl px-4 py-3
                        text-white placeholder-white/25 text-sm mb-4
                        focus:outline-none focus:border-white/20" />

      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">
        {filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}
      </div>

      <div className="flex flex-col gap-2">
        {filtrados.map(u => {
          const guardiasNombres = u.user_guards
            ?.map(ug => ug.guards?.nombre).filter(Boolean).join(', ')
          return (
            <div key={u.id}
                 className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{u.nombre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.activo
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-red-900/40 text-red-400'
                    }`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">
                    {u.jerarquia && `${u.jerarquia} · `}
                    @{u.username} · {getRolLabel(u.rol)}
                  </div>
                  {guardiasNombres && (
                    <div className="text-white/30 text-xs mt-0.5">
                      🚒 {guardiasNombres}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => abrirEditar(u)}
                          className="bg-white/8 hover:bg-white/12 border border-white/8
                                     text-white/60 text-xs px-3 py-1.5 rounded-lg">
                    ✏️
                  </button>
                  <button onClick={() => toggleActivo(u)}
                          className={`text-xs px-3 py-1.5 rounded-lg border ${
                            u.activo
                              ? 'bg-red-900/20 border-red-500/20 text-red-400 hover:bg-red-900/40'
                              : 'bg-green-900/20 border-green-500/20 text-green-400 hover:bg-green-900/40'
                          }`}>
                    {u.activo ? '⛔' : '✅'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {filtrados.length === 0 && (
          <Empty text={buscar ? 'Sin resultados' : 'No hay usuarios todavía'} />
        )}
      </div>
    </PageShell>
  )
}

function getRolLabel(rol) {
  const labels = { admin: '⚙️ Admin', jefe: '👮 Jefe', bombero: '🚒 Bombero' }
  return labels[rol] || rol
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
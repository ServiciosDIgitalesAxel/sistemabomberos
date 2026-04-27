'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function SuperUsuariosClient({ usuarios: inicial, cuarteles, session }) {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState(inicial)
  const [buscar, setBuscar] = useState('')
  const [filtroCuartel, setFiltroCuartel] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [editando, setEditando] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const filtrados = useMemo(() => usuarios.filter(u => {
    const matchBuscar = !buscar ||
      u.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      u.username.toLowerCase().includes(buscar.toLowerCase())
    const matchCuartel = !filtroCuartel || u.organizations?.id === filtroCuartel
    const matchRol = !filtroRol || u.rol === filtroRol
    return matchBuscar && matchCuartel && matchRol
  }), [usuarios, buscar, filtroCuartel, filtroRol])

  async function toggleActivo(u) {
    const res = await fetch('/api/superadmin/usuarios', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, activo: !u.activo })
    })
    if (res.ok) {
      setUsuarios(prev => prev.map(x =>
        x.id === u.id ? { ...x, activo: !x.activo } : x
      ))
      setMsg(u.activo ? '⛔ Usuario desactivado' : '✅ Usuario activado')
    }
  }

  async function guardarEdicion() {
    if (!editando) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/superadmin/usuarios', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editando.id, rol: editando.rol,
          ...(newPassword && { password: newPassword })
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setUsuarios(prev => prev.map(x =>
        x.id === editando.id ? { ...x, rol: editando.rol } : x
      ))
      setMsg('✅ Usuario actualizado')
      setEditando(null); setNewPassword('')
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <PageShell title="Todos los Usuarios"
               subtitle={`${filtrados.length} usuario${filtrados.length !== 1 ? 's' : ''}`}>

      {msg   && <Msg type="success" text={msg}   />}
      {error && <Msg type="error"   text={error} />}

      {/* Filtros */}
      <div className="flex flex-col gap-2 mb-4">
        <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
               placeholder="🔍 Buscar por nombre o usuario..."
               className="w-full bg-[#0a1830] border border-white/8 rounded-xl px-4 py-3
                          text-white placeholder-white/25 text-sm
                          focus:outline-none focus:border-white/20" />
        <div className="grid grid-cols-2 gap-2">
          <select value={filtroCuartel} onChange={e => setFiltroCuartel(e.target.value)}
                  className="bg-[#0a1830] border border-white/8 rounded-lg px-3 py-2.5
                             text-white text-sm focus:outline-none">
            <option value="">Todos los cuarteles</option>
            {cuarteles.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
                  className="bg-[#0a1830] border border-white/8 rounded-lg px-3 py-2.5
                             text-white text-sm focus:outline-none">
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="jefe">Jefe</option>
            <option value="bombero">Bombero</option>
          </select>
        </div>
      </div>

      {/* Modal edición */}
      {editando && (
        <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                        flex flex-col gap-3 mb-4">
          <div className="text-white font-medium">✏️ Editando: {editando.nombre}</div>
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs">Rol</label>
            <select value={editando.rol}
                    onChange={e => setEditando({ ...editando, rol: e.target.value })}
                    className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                               text-white text-sm focus:outline-none">
              <option value="bombero">🚒 Bombero</option>
              <option value="jefe">👮 Jefe de Guardia</option>
              <option value="admin">⚙️ Administrador</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-xs">Nueva contraseña (opcional)</label>
            <input type="password" value={newPassword}
                   onChange={e => setNewPassword(e.target.value)}
                   placeholder="Dejar vacío para no cambiar"
                   className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                              text-white placeholder-white/25 text-sm focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={guardarEdicion} disabled={loading}
                    className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50
                               text-white font-semibold py-2.5 rounded-xl text-sm">
              {loading ? '...' : 'Guardar'}
            </button>
            <button onClick={() => { setEditando(null); setNewPassword(''); setError('') }}
                    className="flex-1 bg-white/8 border border-white/10
                               text-white/60 font-medium py-2.5 rounded-xl text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtrados.map(u => (
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
                  @{u.username} · {u.rol}
                  {u.jerarquia && ` · ${u.jerarquia}`}
                </div>
                {u.organizations && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                         style={{ background: u.organizations.color_primario }} />
                    <span className="text-white/30 text-xs">{u.organizations.nombre}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setEditando(u); setError('') }}
                        className="bg-white/8 hover:bg-white/12 border border-white/8
                                   text-white/60 text-xs px-3 py-1.5 rounded-lg">
                  ✏️
                </button>
                <button onClick={() => toggleActivo(u)}
                        className={`text-xs px-3 py-1.5 rounded-lg border ${
                          u.activo
                            ? 'bg-red-900/20 border-red-500/20 text-red-400'
                            : 'bg-green-900/20 border-green-500/20 text-green-400'
                        }`}>
                  {u.activo ? '⛔' : '✅'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="bg-[#0a1830] border border-white/8 rounded-xl p-8
                          text-center text-white/30 text-sm">Sin resultados</div>
        )}
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
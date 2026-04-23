'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

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

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBuscar = !buscar ||
        u.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
        u.username.toLowerCase().includes(buscar.toLowerCase())
      const matchCuartel = !filtroCuartel || u.organizations?.id === filtroCuartel
      const matchRol = !filtroRol || u.rol === filtroRol
      return matchBuscar && matchCuartel && matchRol
    })
  }, [usuarios, buscar, filtroCuartel, filtroRol])

  async function toggleActivo(u) {
    const res = await fetch('/api/superadmin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, activo: !u.activo })
    })
    if (res.ok) {
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x))
      setMsg(u.activo ? '⛔ Usuario desactivado' : '✅ Usuario activado')
    }
  }

  async function guardarEdicion() {
    if (!editando) return
    setLoading(true)
    setError('')
    try {
      const body = {
        id:  editando.id,
        rol: editando.rol,
        ...(newPassword && { password: newPassword })
      }
      const res = await fetch('/api/superadmin/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setUsuarios(prev => prev.map(x => x.id === editando.id ? { ...x, rol: editando.rol } : x))
      setMsg('✅ Usuario actualizado')
      setEditando(null)
      setNewPassword('')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/home')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Todos los Usuarios</div>
          <div className="text-white/60 text-xs">{filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 max-w-3xl mx-auto w-full">

        {msg && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                          px-4 py-3 text-green-300 text-sm">{msg}</div>
        )}

        {/* Filtros */}
        <div className="flex flex-col gap-2">
          <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
                 placeholder="🔍 Buscar por nombre o usuario..."
                 className="bg-white/5 border border-white/10 rounded-xl px-4 py-3
                            text-white placeholder-white/30 text-sm focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={filtroCuartel} onChange={e => setFiltroCuartel(e.target.value)}
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white text-sm focus:outline-none">
              <option value="">Todos los cuarteles</option>
              {cuarteles.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
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
          <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-white font-bold">✏️ Editando: {editando.nombre}</div>
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg
                              px-3 py-2 text-red-300 text-xs">{error}</div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Rol</label>
              <select value={editando.rol}
                      onChange={e => setEditando({ ...editando, rol: e.target.value })}
                      className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                                 text-white text-sm focus:outline-none">
                <option value="bombero">🚒 Bombero</option>
                <option value="jefe">👮 Jefe de Guardia</option>
                <option value="admin">⚙️ Administrador</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs">Nueva contraseña (opcional)</label>
              <input type="password" value={newPassword}
                     onChange={e => setNewPassword(e.target.value)}
                     placeholder="Dejar vacío para no cambiar"
                     className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                                text-white placeholder-white/30 text-sm focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={guardarEdicion} disabled={loading}
                      className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                                 text-white font-bold py-2.5 rounded-xl text-sm">
                {loading ? '⏳...' : 'Guardar'}
              </button>
              <button onClick={() => { setEditando(null); setNewPassword(''); setError('') }}
                      className="flex-1 bg-white/8 border border-white/10
                                 text-white/70 font-bold py-2.5 rounded-xl text-sm">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="flex flex-col gap-2">
          {filtrados.map(u => (
            <div key={u.id}
                 className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold text-sm">{u.nombre}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      u.activo ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
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
                      <span className="text-white/40 text-xs">{u.organizations.nombre}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditando(u); setError('') }}
                          className="bg-white/8 hover:bg-white/15 border border-white/10
                                     text-white/70 text-xs px-3 py-1.5 rounded-lg">
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
            <div className="text-center text-white/40 text-sm py-8">
              Sin resultados
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
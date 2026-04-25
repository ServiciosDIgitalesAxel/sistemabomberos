'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PerfilClient({ session }) {
  const router = useRouter()
  const [tab, setTab] = useState('info')
  const [nombre, setNombre] = useState(session.nombre || '')
  const [jerarquia, setJerarquia] = useState(session.jerarquia || '')
  const [passActual, setPassActual] = useState('')
  const [passNuevo, setPassNuevo] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function guardarPerfil(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, jerarquia })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(data.message)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function cambiarPassword(e) {
    e.preventDefault()
    if (passNuevo !== passConfirm) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    if (passNuevo.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordActual: passActual,
          passwordNuevo:  passNuevo
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(data.message)
      setPassActual('')
      setPassNuevo('')
      setPassConfirm('')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getRolLabel = (rol) => {
    const labels = {
      superadmin: 'Super Administrador',
      admin: 'Administrador',
      jefe: 'Jefe de Guardia',
      bombero: 'Bombero'
    }
    return labels[rol] || rol
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.trim().split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('')
  }

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
          <div className="text-white font-bold text-base">Mi Perfil</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">

        {/* Avatar y datos */}
        <div className="bg-[#0a1830] border-b border-white/8 px-5 py-6
                        flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b01e1e] to-[#7a0000]
                          flex items-center justify-center text-white text-2xl font-bold
                          shadow-lg shadow-red-900/30">
            {getInitials(session.nombre)}
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-xl">{session.nombre}</div>
            <div className="text-white/50 text-sm mt-1">
              {session.jerarquia && `${session.jerarquia} · `}
              {getRolLabel(session.rol)}
            </div>
            <div className="text-white/30 text-xs mt-1">@{session.username}</div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10
                          rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/50 text-xs">Sesión activa</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4">
          {[
            { key: 'info', label: '👤 Datos' },
            { key: 'password', label: '🔑 Contraseña' },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccess('') }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      tab === t.key
                        ? 'bg-[#b01e1e] text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 px-5 py-4">

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl
                            px-4 py-3 text-red-300 text-sm mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                            px-4 py-3 text-green-300 text-sm mb-4">{success}</div>
          )}

          {/* Datos personales */}
          {tab === 'info' && (
            <form onSubmit={guardarPerfil} className="flex flex-col gap-4">

              <div className="flex flex-col gap-3 bg-[#0a1830] border border-white/10
                              rounded-xl p-4">
                <div className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  Información de solo lectura
                </div>
                <InfoRow label="Usuario"    value={`@${session.username}`} />
                <InfoRow label="Rol"        value={getRolLabel(session.rol)} />
                <InfoRow label="Cuartel"    value={session.org_nombre} />
                <InfoRow label="ID"         value={session.id?.substring(0,8) + '...'} />
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-white/50 text-xs font-bold uppercase tracking-wider">
                  Datos editables
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Nombre completo
                  </label>
                  <input type="text" value={nombre}
                         onChange={e => setNombre(e.target.value)}
                         className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                                    text-white text-sm focus:outline-none focus:border-white/30" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Jerarquía
                  </label>
                  <input type="text" value={jerarquia}
                         onChange={e => setJerarquia(e.target.value)}
                         placeholder="Ej: Bombero 1ra"
                         className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                                    text-white placeholder-white/30 text-sm
                                    focus:outline-none focus:border-white/30" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                      className="w-full bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                                 text-white font-bold py-3.5 rounded-xl transition-all">
                {loading ? '⏳ Guardando...' : '💾 Guardar cambios'}
              </button>
            </form>
          )}

          {/* Cambiar contraseña */}
          {tab === 'password' && (
            <form onSubmit={cambiarPassword} className="flex flex-col gap-4">

              <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4
                              text-white/40 text-xs">
                La contraseña debe tener al menos 4 caracteres.
              </div>

              {[
                { label: 'Contraseña actual', val: passActual, set: setPassActual },
                { label: 'Nueva contraseña',  val: passNuevo,  set: setPassNuevo  },
                { label: 'Confirmar nueva',   val: passConfirm,set: setPassConfirm },
              ].map((f, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full bg-white/8 border border-white/10 rounded-lg
                                 px-3 py-2.5 pr-10 text-white text-sm
                                 focus:outline-none focus:border-white/30"
                    />
                    {i === 0 && (
                      <button type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2
                                         text-white/40 hover:text-white/70 text-sm">
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="submit" disabled={loading}
                      className="w-full bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                                 text-white font-bold py-3.5 rounded-xl transition-all">
                {loading ? '⏳ Actualizando...' : '🔑 Cambiar contraseña'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1
                    border-b border-white/5 last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  )
}
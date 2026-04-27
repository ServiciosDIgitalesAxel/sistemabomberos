'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

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
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/perfil', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, jerarquia })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(data.message)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  async function cambiarPassword(e) {
    e.preventDefault()
    if (passNuevo !== passConfirm) { setError('Las contraseñas no coinciden'); return }
    if (passNuevo.length < 4) { setError('Mínimo 4 caracteres'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/perfil', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordActual: passActual, passwordNuevo: passNuevo })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(data.message)
      setPassActual(''); setPassNuevo(''); setPassConfirm('')
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <PageShell title="Mi Perfil" subtitle={session.org_nombre}>
      <div className="max-w-lg mx-auto">

        {/* Avatar */}
        <div className="bg-[#0a1830] border border-white/8 rounded-xl px-5 py-6
                        flex flex-col items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-red-700 flex items-center
                          justify-center text-white text-2xl font-bold">
            {getInitials(session.nombre)}
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-lg">{session.nombre}</div>
            <div className="text-white/40 text-sm mt-0.5">
              {session.jerarquia && `${session.jerarquia} · `}
              {getRolLabel(session.rol)}
            </div>
            <div className="text-white/25 text-xs mt-0.5">@{session.username}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'info',     label: '👤 Datos' },
            { key: 'password', label: '🔑 Contraseña' },
          ].map(t => (
            <button key={t.key}
                    onClick={() => { setTab(t.key); setError(''); setSuccess('') }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                      tab === t.key
                        ? 'bg-red-700 text-white'
                        : 'bg-white/6 text-white/50 hover:bg-white/10'
                    }`}>
              {t.label}
            </button>
          ))}
        </div>

        {error   && <Msg type="error"   text={error}   />}
        {success && <Msg type="success" text={success} />}

        {/* Datos */}
        {tab === 'info' && (
          <form onSubmit={guardarPerfil} className="flex flex-col gap-4">
            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                            flex flex-col gap-3">
              <div className="text-white/30 text-xs font-semibold uppercase
                              tracking-wider mb-1">
                Solo lectura
              </div>
              {[
                { label: 'Usuario', value: `@${session.username}` },
                { label: 'Rol',     value: getRolLabel(session.rol) },
                { label: 'Cuartel', value: session.org_nombre },
              ].map(r => (
                <div key={r.label}
                     className="flex items-center justify-between py-1
                                border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-sm">{r.label}</span>
                  <span className="text-white/70 text-sm font-medium">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                            flex flex-col gap-3">
              <div className="text-white/30 text-xs font-semibold uppercase
                              tracking-wider mb-1">
                Editable
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase
                                   tracking-wider">
                  Nombre completo
                </label>
                <input type="text" value={nombre}
                       onChange={e => setNombre(e.target.value)}
                       className="bg-[#0d1f38] border border-white/10 rounded-lg
                                  px-3 py-2.5 text-white text-sm
                                  focus:outline-none focus:border-white/25" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase
                                   tracking-wider">
                  Jerarquía
                </label>
                <input type="text" value={jerarquia}
                       onChange={e => setJerarquia(e.target.value)}
                       placeholder="Ej: Bombero 1ra"
                       className="bg-[#0d1f38] border border-white/10 rounded-lg
                                  px-3 py-2.5 text-white placeholder-white/25 text-sm
                                  focus:outline-none focus:border-white/25" />
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                               text-white font-semibold py-3.5 rounded-xl text-sm">
              {loading ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
          </form>
        )}

        {/* Contraseña */}
        {tab === 'password' && (
          <form onSubmit={cambiarPassword} className="flex flex-col gap-4">
            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                            text-white/30 text-xs">
              La contraseña debe tener al menos 4 caracteres.
            </div>
            {[
              { label: 'Contraseña actual', val: passActual, set: setPassActual },
              { label: 'Nueva contraseña',  val: passNuevo,  set: setPassNuevo  },
              { label: 'Confirmar nueva',   val: passConfirm,set: setPassConfirm },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase
                                   tracking-wider">
                  {f.label}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'}
                         value={f.val} onChange={e => f.set(e.target.value)}
                         required autoComplete="new-password"
                         className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                    px-3 py-2.5 pr-10 text-white text-sm
                                    focus:outline-none focus:border-white/25" />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                                       text-white/30 hover:text-white/60 text-sm">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading}
                    className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                               text-white font-semibold py-3.5 rounded-xl text-sm">
              {loading ? 'Actualizando...' : '🔑 Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </PageShell>
  )
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map(p => p[0].toUpperCase()).join('')
}

function getRolLabel(rol) {
  const labels = {
    superadmin: 'Super Admin', admin: 'Administrador',
    jefe: 'Jefe de Guardia', bombero: 'Bombero'
  }
  return labels[rol] || rol
}

function Msg({ type, text }) {
  const s = type === 'error'
    ? 'bg-red-900/20 border-red-500/20 text-red-400'
    : 'bg-green-900/20 border-green-500/20 text-green-400'
  return <div className={`border rounded-xl px-4 py-3 text-sm mb-4 ${s}`}>{text}</div>
}
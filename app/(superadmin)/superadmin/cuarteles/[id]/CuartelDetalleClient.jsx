'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CuartelDetalleClient({
  cuartel, usuarios, guardias, actividades, session
}) {
  const router = useRouter()
  const [tab, setTab] = useState('info')
  const [activo, setActivo] = useState(cuartel.activa)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  // Form edición
  const [editando, setEditando] = useState(false)
  const [formNombre, setFormNombre] = useState(cuartel.nombre)
  const [formColor, setFormColor] = useState(cuartel.color_primario)
  const [formLogo, setFormLogo] = useState(cuartel.logo_url || '')
  const [guardando, setGuardando] = useState(false)

  async function toggleActivo() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch(`/api/superadmin/cuarteles/${cuartel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: !activo })
      })
      if (res.ok) {
        setActivo(!activo)
        setMsg(activo ? '⛔ Cuartel desactivado' : '✅ Cuartel activado')
      }
    } finally {
      setLoading(false)
    }
  }

  async function guardarEdicion(e) {
    e.preventDefault()
    if (!formNombre.trim()) { setError('El nombre es obligatorio'); return }
    setGuardando(true)
    setError('')
    setMsg('')
    try {
      const res = await fetch(`/api/superadmin/cuarteles/${cuartel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:  formNombre.trim(),
          color:   formColor,
          logoUrl: formLogo || null
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar'); return }
      setMsg('✅ Cuartel actualizado correctamente')
      setEditando(false)
    } catch {
      setError('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  const tabs = [
    { key: 'info',        label: 'Info' },
    { key: 'editar',      label: '✏️ Editar' },
    { key: 'usuarios',    label: `Usuarios (${usuarios.length})` },
    { key: 'guardias',    label: `Guardias (${guardias.length})` },
    { key: 'actividades', label: `Actividades (${actividades.length})` },
  ]

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      {/* Header */}
      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 lg:hidden">
        <button onClick={() => router.push('/superadmin/cuarteles')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-base truncate">{formNombre}</div>
          <div className="text-white/60 text-xs">Detalle del cuartel</div>
        </div>
      </div>

      {/* Volver desktop */}
      <div className="hidden lg:flex px-6 pt-6 pb-2">
        <button onClick={() => router.push('/superadmin/cuarteles')}
                className="bg-white/8 hover:bg-white/12 border border-white/10
                           text-white/70 text-xs font-semibold px-4 py-2 rounded-lg
                           transition-all">
          ← Volver a cuarteles
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-5 py-4">

        {/* Header cuartel */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl
                        px-5 py-4 flex items-center gap-4 mb-4">
          {(formLogo || cuartel.logo_url) ? (
            <img src={formLogo || cuartel.logo_url} alt={formNombre}
                 className="w-14 h-14 rounded-xl object-contain bg-white/10 flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center
                            justify-center text-2xl font-bold text-white"
                 style={{ background: formColor }}>
              {formNombre.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg leading-tight truncate">
              {formNombre}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activo
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-red-900/40 text-red-400'
              }`}>
                {activo ? '✅ Activo' : '⛔ Inactivo'}
              </span>
              <span className="text-white/40 text-xs">
                {new Date(cuartel.created_at).toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>
          <button
            onClick={toggleActivo}
            disabled={loading}
            className={`text-xs font-bold px-3 py-2 rounded-lg border
                        transition-all flex-shrink-0 ${
              activo
                ? 'bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/40'
                : 'bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-900/40'
            }`}
          >
            {loading ? '...' : activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>

        {/* Mensajes */}
        {msg && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                          px-4 py-3 text-green-300 text-sm mb-4">{msg}</div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl
                          px-4 py-3 text-red-300 text-sm mb-4">{error}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setError('') }}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap
                          transition-all flex-shrink-0 ${
                tab === t.key
                  ? 'bg-[#b01e1e] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Info */}
        {tab === 'info' && (
          <div className="flex flex-col gap-3">
            <InfoRow label="ID"         value={cuartel.id.substring(0,8) + '...'} />
            <InfoRow label="Nombre"     value={formNombre} />
            <InfoRow label="Color"      value={
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex-shrink-0"
                     style={{ background: formColor }} />
                <span>{formColor}</span>
              </div>
            } />
            <InfoRow label="Logo"       value={
              formLogo
                ? <a href={formLogo} target="_blank" rel="noreferrer"
                     className="text-blue-400 underline text-xs truncate max-w-[180px]">
                    Ver logo
                  </a>
                : 'Sin logo'
            } />
            <InfoRow label="Usuarios"   value={usuarios.length} />
            <InfoRow label="Guardias"   value={guardias.length} />
            <InfoRow label="Actividades"value={actividades.length} />
            <InfoRow label="Estado"     value={activo ? '✅ Activo' : '⛔ Inactivo'} />
          </div>
        )}

        {/* Tab: Editar */}
        {tab === 'editar' && (
          <form onSubmit={guardarEdicion}
                className="bg-[#0a1830] border border-white/10 rounded-xl p-5
                           flex flex-col gap-4">
            <h3 className="text-white font-bold text-base">✏️ Editar cuartel</h3>

            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Nombre del Cuartel *
              </label>
              <input
                type="text"
                value={formNombre}
                onChange={e => setFormNombre(e.target.value)}
                required
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                URL del Logo
              </label>
              <input
                type="url"
                value={formLogo}
                onChange={e => setFormLogo(e.target.value)}
                placeholder="https://... (link a imagen)"
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white placeholder-white/30 text-sm
                           focus:outline-none focus:border-white/30"
              />
              {formLogo && (
                <img src={formLogo} alt="Preview"
                     className="w-16 h-16 rounded-xl object-contain bg-white/10 mt-1" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Color Principal
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formColor}
                  onChange={e => setFormColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-white/10
                             bg-transparent cursor-pointer"
                />
                <span className="text-white/50 text-sm">{formColor}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="border border-white/8 rounded-xl p-3 flex items-center gap-3
                            bg-white/3">
              <div className="text-white/40 text-xs">Preview:</div>
              {formLogo ? (
                <img src={formLogo} alt="Preview"
                     className="w-8 h-8 rounded-lg object-contain bg-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex-shrink-0"
                     style={{ background: formColor }} />
              )}
              <span className="text-white text-sm font-semibold truncate">{formNombre}</span>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: formColor }} />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                           text-white font-bold py-3 rounded-xl transition-all"
              >
                {guardando ? '⏳ Guardando...' : '💾 Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormNombre(cuartel.nombre)
                  setFormColor(cuartel.color_primario)
                  setFormLogo(cuartel.logo_url || '')
                  setError('')
                  setTab('info')
                }}
                className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                           text-white/70 font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Tab: Usuarios */}
        {tab === 'usuarios' && (
          <div className="flex flex-col gap-2">
            {usuarios.length === 0 && (
              <div className="text-center text-white/40 text-sm py-8 bg-white/4
                              border border-white/8 rounded-xl">
                Sin usuarios
              </div>
            )}
            {usuarios.map(u => (
              <div key={u.id}
                   className="bg-[#0a1830] border border-white/10 rounded-xl
                              px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{u.nombre}</div>
                  <div className="text-white/40 text-xs mt-0.5">
                    @{u.username} · {getRolLabel(u.rol)}
                    {u.jerarquia && ` · ${u.jerarquia}`}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                  u.activo
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-red-900/40 text-red-400'
                }`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Guardias */}
        {tab === 'guardias' && (
          <div className="flex flex-col gap-2">
            {guardias.length === 0 && (
              <div className="text-center text-white/40 text-sm py-8 bg-white/4
                              border border-white/8 rounded-xl">
                Sin guardias configuradas
              </div>
            )}
            {guardias.map(g => (
              <div key={g.id}
                   className="bg-[#0a1830] border border-white/10 rounded-xl
                              px-4 py-3 flex items-center justify-between gap-3">
                <div className="text-white text-sm font-semibold">🚒 {g.nombre}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  g.activa
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-red-900/40 text-red-400'
                }`}>
                  {g.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Actividades */}
        {tab === 'actividades' && (
          <div className="flex flex-col gap-2">
            {actividades.length === 0 && (
              <div className="text-center text-white/40 text-sm py-8 bg-white/4
                              border border-white/8 rounded-xl">
                Sin actividades configuradas
              </div>
            )}
            {actividades.map(a => (
              <div key={a.id}
                   className="bg-[#0a1830] border border-white/10 rounded-xl
                              px-4 py-3 flex items-center gap-3">
                <div className="w-1 self-stretch rounded-full flex-shrink-0"
                     style={{ background: a.color }} />
                <span className="text-xl flex-shrink-0">{a.icono}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{a.nombre}</div>
                  <div className="text-white/40 text-xs">{a.tipo_base}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                  a.activo
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-red-900/40 text-red-400'
                }`}>
                  {a.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-[#0a1830] border border-white/10 rounded-xl px-4 py-3
                    flex items-center justify-between gap-3">
      <span className="text-white/50 text-sm flex-shrink-0">{label}</span>
      <span className="text-white text-sm font-semibold text-right">{value}</span>
    </div>
  )
}

function getRolLabel(rol) {
  const labels = {
    superadmin: 'Super Admin', admin: 'Administrador',
    jefe: 'Jefe de Guardia', bombero: 'Bombero'
  }
  return labels[rol] || rol
}
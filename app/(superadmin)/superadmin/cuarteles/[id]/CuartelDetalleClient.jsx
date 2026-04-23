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

  async function toggleActivo() {
    setLoading(true)
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

  const tabs = [
    { key: 'info',       label: 'Info' },
    { key: 'usuarios',   label: `Usuarios (${usuarios.length})` },
    { key: 'guardias',   label: `Guardias (${guardias.length})` },
    { key: 'actividades',label: `Actividades (${actividades.length})` },
  ]

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/superadmin/cuarteles')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-base truncate">{cuartel.nombre}</div>
          <div className="text-white/60 text-xs">Detalle del cuartel</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">

        {/* Header cuartel */}
        <div className="px-5 py-5 bg-[#0a1830] border-b border-white/8
                        flex items-center gap-4">
          {cuartel.logo_url ? (
            <img src={cuartel.logo_url} alt={cuartel.nombre}
                 className="w-16 h-16 rounded-xl object-contain bg-white/10 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center
                            justify-center text-2xl font-bold text-white"
                 style={{ background: cuartel.color_primario }}>
              {cuartel.nombre.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg leading-tight">
              {cuartel.nombre}
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
                Creado: {new Date(cuartel.created_at).toLocaleDateString('es-AR')}
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
            {activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>

        {msg && (
          <div className="mx-5 mt-3 bg-white/8 border border-white/10 rounded-xl
                          px-4 py-2 text-white/70 text-sm">
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap
                          transition-all ${
                tab === t.key
                  ? 'bg-[#b01e1e] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 px-5 py-4">

          {/* Info */}
          {tab === 'info' && (
            <div className="flex flex-col gap-3">
              <InfoRow label="ID" value={cuartel.id} />
              <InfoRow label="Color" value={
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded"
                       style={{ background: cuartel.color_primario }} />
                  {cuartel.color_primario}
                </div>
              } />
              <InfoRow label="Logo URL" value={cuartel.logo_url || 'Sin logo'} />
              <InfoRow label="Usuarios" value={usuarios.length} />
              <InfoRow label="Guardias" value={guardias.length} />
              <InfoRow label="Actividades" value={actividades.length} />
            </div>
          )}

          {/* Usuarios */}
          {tab === 'usuarios' && (
            <div className="flex flex-col gap-2">
              {usuarios.length === 0 && (
                <div className="text-center text-white/40 text-sm py-8">
                  Sin usuarios
                </div>
              )}
              {usuarios.map(u => (
                <div key={u.id}
                     className="bg-[#0a1830] border border-white/10 rounded-xl
                                px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white text-sm font-semibold">{u.nombre}</div>
                    <div className="text-white/40 text-xs mt-0.5">
                      @{u.username} · {u.rol}
                      {u.jerarquia && ` · ${u.jerarquia}`}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
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

          {/* Guardias */}
          {tab === 'guardias' && (
            <div className="flex flex-col gap-2">
              {guardias.length === 0 && (
                <div className="text-center text-white/40 text-sm py-8">
                  Sin guardias
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

          {/* Actividades */}
          {tab === 'actividades' && (
            <div className="flex flex-col gap-2">
              {actividades.length === 0 && (
                <div className="text-center text-white/40 text-sm py-8">
                  Sin actividades
                </div>
              )}
              {actividades.map(a => (
                <div key={a.id}
                     className="bg-[#0a1830] border border-white/10 rounded-xl
                                px-4 py-3 flex items-center gap-3">
                  <div className="w-1 self-stretch rounded-full"
                       style={{ background: a.color }} />
                  <span className="text-xl">{a.icono}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-semibold">{a.nombre}</div>
                    <div className="text-white/40 text-xs">{a.tipo_base}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
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
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-[#0a1830] border border-white/10 rounded-xl px-4 py-3
                    flex items-center justify-between gap-3">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white text-sm font-semibold text-right">{value}</span>
    </div>
  )
}
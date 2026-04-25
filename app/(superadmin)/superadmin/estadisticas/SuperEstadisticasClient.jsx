'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperEstadisticasClient({ session }) {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/superadmin/estadisticas')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3 lg:hidden">
        <button onClick={() => router.push('/home')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Estadísticas Globales</div>
          <div className="text-white/60 text-xs">Toda la plataforma</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 max-w-3xl mx-auto w-full">

        {loading && (
          <div className="text-center text-white/40 py-12">⏳ Cargando...</div>
        )}

        {data && (
          <>
            {/* Totales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard numero={data.totalCuarteles}    label="Cuarteles"         color="#3b6ec8" />
              <StatCard numero={data.cuartelesActivos}  label="Activos"           color="#1a7a46" />
              <StatCard numero={data.totalUsuarios}     label="Usuarios"          color="#c98000" />
              <StatCard numero={data.totalRegistros}    label="Registros totales" color="#b01e1e" />
            </div>

            {/* Por cuartel */}
            <div className="text-white/60 text-xs font-bold uppercase tracking-wider mt-2">
              Por cuartel
            </div>

            <div className="flex flex-col gap-3">
              {(data.porOrg || []).map(org => (
                <div key={org.id}
                     className="bg-[#0a1830] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {org.logo ? (
                      <img src={org.logo} alt={org.nombre}
                           className="w-10 h-10 rounded-lg object-contain bg-white/10 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex-shrink-0"
                           style={{ background: org.color }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm">{org.nombre}</div>
                      <div className="text-white/40 text-xs">
                        {org.activa ? '✅ Activo' : '⛔ Inactivo'}
                        {org.ultimoRegistro && ` · Último registro: ${org.ultimoRegistro}`}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat numero={org.totalUsuarios}    label="Usuarios" />
                    <MiniStat numero={org.usuariosActivos}  label="Activos"  />
                    <MiniStat numero={org.totalRegistros}   label="Registros"/>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ numero, label, color }) {
  return (
    <div className="bg-[#0a1830] border border-white/10 rounded-xl p-4 text-center">
      <div className="text-3xl font-bold" style={{ color }}>{numero}</div>
      <div className="text-white/40 text-xs mt-1">{label}</div>
    </div>
  )
}

function MiniStat({ numero, label }) {
  return (
    <div className="bg-white/5 rounded-lg p-2 text-center">
      <div className="text-white font-bold text-lg">{numero}</div>
      <div className="text-white/40 text-xs">{label}</div>
    </div>
  )
}
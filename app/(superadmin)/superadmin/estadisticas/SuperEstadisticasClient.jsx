'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

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
    <PageShell title="Estadísticas Globales" subtitle="Toda la plataforma">
      {loading && (
        <div className="text-white/30 text-sm text-center py-12">
          ⏳ Cargando...
        </div>
      )}
      {data && (
        <div className="flex flex-col gap-6">

          {/* Totales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard numero={data.totalCuarteles}   label="Cuarteles"       color="#3b6ec8" />
            <StatCard numero={data.cuartelesActivos} label="Activos"         color="#1a7a46" />
            <StatCard numero={data.totalUsuarios}    label="Usuarios"        color="#c98000" />
            <StatCard numero={data.totalRegistros}   label="Registros total" color="#b01e1e" />
          </div>

          <div className="text-white/30 text-xs font-semibold uppercase tracking-wider">
            Por cuartel
          </div>

          <div className="flex flex-col gap-3">
            {(data.porOrg || []).map(org => (
              <div key={org.id}
                   className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  {org.logo ? (
                    <img src={org.logo} alt={org.nombre}
                         className="w-10 h-10 rounded-lg object-contain
                                    bg-white/8 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex-shrink-0"
                         style={{ background: org.color }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">{org.nombre}</div>
                    <div className="text-white/30 text-xs">
                      {org.activa ? '✅ Activo' : '⛔ Inactivo'}
                      {org.ultimoRegistro && ` · Último: ${org.ultimoRegistro}`}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat numero={org.totalUsuarios}   label="Usuarios"  />
                  <MiniStat numero={org.usuariosActivos} label="Activos"   />
                  <MiniStat numero={org.totalRegistros}  label="Registros" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}

function StatCard({ numero, label, color }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4 text-center">
      <div className="text-3xl font-bold" style={{ color }}>{numero}</div>
      <div className="text-white/30 text-xs mt-1">{label}</div>
    </div>
  )
}

function MiniStat({ numero, label }) {
  return (
    <div className="bg-white/4 rounded-lg p-2 text-center">
      <div className="text-white font-bold text-lg">{numero}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  )
}
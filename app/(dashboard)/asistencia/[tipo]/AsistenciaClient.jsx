'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AsistenciaClient({
  session, actividad, guardias, registroHoy
}) {
  const router = useRouter()
  const [estado, setEstado] = useState(
    actividad.estados?.[0] || 'Presente'
  )
  const [guardiaId, setGuardiaId] = useState(guardias[0]?.id || '')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [registrado, setRegistrado] = useState(!!registroHoy)

  const esEvento = actividad.tipo_base === 'evento'
  const esGuardia = actividad.tipo_base === 'guardia'

  async function handleRegistrar() {
    setLoading(true)
    setError('')

    try {
      const ahora = new Date()
      const hora = ahora.toTimeString().split(' ')[0]

      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type_id: actividad.id,
          guard_id:         guardiaId || null,
          estado,
          observaciones,
          fecha:            ahora.toISOString().split('T')[0],
          hora_ingreso:     hora,
        })
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setSuccess(`✅ Asistencia registrada · ${estado} · ${hora.substring(0,5)}`)
      setRegistrado(true)

    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
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
          <div className="text-white font-bold text-base">
            {actividad.icono} {actividad.nombre}
          </div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-5">

        {/* Info usuario */}
        <div className="bg-[#0a1830] border border-white/10 rounded-xl px-4 py-3
                        border-l-2" style={{ borderLeftColor: actividad.color }}>
          <div className="text-white font-semibold">{session.nombre}</div>
          <div className="text-white/50 text-sm">
            {session.jerarquia && `${session.jerarquia} · `}
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </div>
        </div>

        {/* Ya registrado hoy */}
        {registrado && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                          px-4 py-4 text-center">
            <div className="text-green-400 text-2xl mb-2">✅</div>
            <div className="text-green-300 font-bold">
              {success || `Ya registraste asistencia hoy`}
            </div>
            {registroHoy && (
              <div className="text-green-400/60 text-sm mt-1">
                Estado: {registroHoy.estado} ·{' '}
                {registroHoy.hora_ingreso?.substring(0,5)}
              </div>
            )}
          </div>
        )}

        {!registrado && (
          <>
            {/* Guardia (si aplica) */}
            {esGuardia && guardias.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  Guardia
                </label>
                <div className="flex flex-col gap-2">
                  {guardias.map(g => (
                    <label key={g.id}
                           className="flex items-center gap-3 bg-white/5 border border-white/10
                                      rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/8">
                      <input
                        type="radio"
                        name="guardia"
                        value={g.id}
                        checked={guardiaId === g.id}
                        onChange={() => setGuardiaId(g.id)}
                        className="accent-red-500"
                      />
                      <span className="text-white text-sm">🚒 {g.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Estado */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Estado
              </label>
              <div className="flex flex-col gap-2">
                {(actividad.estados || []).map(e => (
                  <label key={e}
                         className="flex items-center gap-3 bg-white/5 border border-white/10
                                    rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/8">
                    <input
                      type="radio"
                      name="estado"
                      value={e}
                      checked={estado === e}
                      onChange={() => setEstado(e)}
                      className="accent-red-500"
                    />
                    <span className="text-white text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Observaciones <span className="text-white/30 normal-case tracking-normal">(opcional)</span>
              </label>
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Agregar nota si es necesario..."
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5
                           text-white placeholder-white/30 text-sm resize-none
                           focus:outline-none focus:border-white/30"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl
                              px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleRegistrar}
              disabled={loading}
              className="w-full bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                         text-white font-bold py-4 rounded-xl transition-all
                         shadow-lg text-base tracking-wide"
            >
              {loading ? '⏳ Registrando...' : '✅ REGISTRAR ASISTENCIA'}
            </button>
          </>
        )}

        {registrado && (
          <button
            onClick={() => router.push('/home')}
            className="w-full bg-white/8 hover:bg-white/12 border border-white/10
                       text-white/70 font-bold py-4 rounded-xl transition-all"
          >
            Volver al inicio
          </button>
        )}

      </div>
    </div>
  )
}
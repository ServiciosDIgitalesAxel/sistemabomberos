'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

export default function AsistenciaClient({
  session, actividad, guardias, registroHoy, enCurso
}) {
  const router = useRouter()
  const esEvento = actividad.tipo_base === 'evento'

  const [estado, setEstado] = useState(actividad.estados?.[0] || 'Presente')
  const [guardiaId, setGuardiaId] = useState(guardias[0]?.id || '')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [registrado, setRegistrado] = useState(
    esEvento ? false : !!registroHoy
  )
  const [eventoEnCurso, setEventoEnCurso] = useState(enCurso)
  const [eventoCompletado, setEventoCompletado] = useState(false)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState('')

  // Timer para eventos en curso
  useEffect(() => {
    if (!esEvento || !eventoEnCurso) return

    function calcularTiempo() {
      const inicio = new Date(`${eventoEnCurso.fecha}T${eventoEnCurso.hora_ingreso}`)
      const ahora  = new Date()
      const diffMs = ahora - inicio
      const horas  = Math.floor(diffMs / (1000 * 60 * 60))
      const mins   = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      setTiempoTranscurrido(`${horas}h ${mins}m`)
    }

    calcularTiempo()
    const interval = setInterval(calcularTiempo, 60000)
    return () => clearInterval(interval)
  }, [eventoEnCurso, esEvento])

  async function handleRegistrarIngreso() {
    setLoading(true)
    setError('')
    try {
      const ahora = new Date()
      const hora  = ahora.toTimeString().split(' ')[0]
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type_id: actividad.id,
          guard_id:         guardiaId || null,
          estado:           'En curso',
          observaciones,
          fecha:            ahora.toISOString().split('T')[0],
          hora_ingreso:     hora,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setEventoEnCurso({
        ...data.registro,
        fecha:        ahora.toISOString().split('T')[0],
        hora_ingreso: hora
      })
      setSuccess(`✅ Ingreso registrado a las ${hora.substring(0, 5)}`)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegistrarEgreso() {
    if (!eventoEnCurso) return
    setLoading(true)
    setError('')
    try {
      const ahora      = new Date()
      const horaEgreso = ahora.toTimeString().split(' ')[0]

      // Calcular tiempo total
      const inicio  = new Date(`${eventoEnCurso.fecha}T${eventoEnCurso.hora_ingreso}`)
      const diffMs  = ahora - inicio
      const horas   = Math.floor(diffMs / (1000 * 60 * 60))
      const mins    = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const tiempo  = `${horas}h ${mins}m`

      const res = await fetch('/api/asistencia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:           eventoEnCurso.id,
          hora_egreso:  horaEgreso,
          tiempo_total: tiempo
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setEventoCompletado(true)
      setEventoEnCurso(null)
      setSuccess(
        `✅ Egreso registrado · Tiempo total: ${tiempo} · ${eventoEnCurso.hora_ingreso?.substring(0,5)} → ${horaEgreso.substring(0,5)}`
      )
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegistrar() {
    setLoading(true)
    setError('')
    try {
      const ahora = new Date()
      const hora  = ahora.toTimeString().split(' ')[0]
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
      setSuccess(`✅ Asistencia registrada · ${estado} · ${hora.substring(0, 5)}`)
      setRegistrado(true)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // ── Render evento ────────────────────────────────────────────
  if (esEvento) {
    return (
      <PageShell title={`${actividad.icono} ${actividad.nombre}`}
                 subtitle={session.org_nombre}>
        <div className="max-w-lg mx-auto flex flex-col gap-4">

          {/* Info usuario */}
          <InfoCard session={session} actividad={actividad} />

          {error && <ErrorBox text={error} />}

          {/* Completado */}
          {eventoCompletado && (
            <div className="bg-green-900/20 border border-green-500/20 rounded-xl
                            px-4 py-6 text-center flex flex-col gap-2">
              <div className="text-3xl">✅</div>
              <div className="text-green-300 font-semibold">{success}</div>
            </div>
          )}

          {/* En curso — mostrar egreso */}
          {!eventoCompletado && eventoEnCurso && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#0a1830] border border-yellow-500/20 rounded-xl p-5">
                <div className="text-yellow-400 text-xs font-semibold uppercase
                                tracking-wider mb-3">
                  ⏱ Evento en curso
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">Ingresaste a las</div>
                    <div className="text-white/40 text-sm">
                      {eventoEnCurso.fecha} · {eventoEnCurso.hora_ingreso?.substring(0, 5)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-2xl">
                      {tiempoTranscurrido || '...'}
                    </div>
                    <div className="text-white/30 text-xs">transcurrido</div>
                  </div>
                </div>
                {eventoEnCurso.observaciones && (
                  <div className="text-white/30 text-xs border-t border-white/6 pt-2">
                    {eventoEnCurso.observaciones}
                  </div>
                )}
              </div>

              <button onClick={handleRegistrarEgreso} disabled={loading}
                      className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                                 text-white font-semibold py-3.5 rounded-xl text-sm">
                {loading ? 'Registrando...' : '🚪 Registrar Egreso'}
              </button>

              <button onClick={() => router.push('/home')}
                      className="w-full bg-white/6 hover:bg-white/10 border border-white/8
                                 text-white/60 font-medium py-3 rounded-xl text-sm">
                Volver (el evento sigue en curso)
              </button>
            </div>
          )}

          {/* Sin evento en curso — mostrar ingreso */}
          {!eventoCompletado && !eventoEnCurso && (
            <div className="flex flex-col gap-4">

              {guardias.length > 0 && (
                <GuardiaSelector guardias={guardias}
                                 guardiaId={guardiaId}
                                 setGuardiaId={setGuardiaId} />
              )}

              <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
                <div className="text-white/40 text-xs font-semibold uppercase
                                tracking-wider mb-2">
                  Observaciones
                  <span className="text-white/20 normal-case tracking-normal
                                   font-normal ml-1">(opcional)</span>
                </div>
                <textarea value={observaciones}
                          onChange={e => setObservaciones(e.target.value)}
                          rows={3}
                          placeholder="Descripción del evento, ubicación, etc..."
                          className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                     px-3 py-2.5 text-white placeholder-white/25 text-sm
                                     resize-none focus:outline-none focus:border-white/25" />
              </div>

              <button onClick={handleRegistrarIngreso} disabled={loading}
                      className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                                 text-white font-semibold py-3.5 rounded-xl text-sm">
                {loading ? 'Registrando...' : '✓ Registrar Ingreso'}
              </button>
            </div>
          )}

          {eventoCompletado && (
            <button onClick={() => router.push('/home')}
                    className="w-full bg-white/6 hover:bg-white/10 border border-white/8
                               text-white/60 font-medium py-3 rounded-xl text-sm">
              ← Volver al inicio
            </button>
          )}

        </div>
      </PageShell>
    )
  }

  // ── Render actividad/guardia normal ─────────────────────────
  return (
    <PageShell title={`${actividad.icono} ${actividad.nombre}`}
               subtitle={session.org_nombre}>
      <div className="max-w-lg mx-auto flex flex-col gap-4">

        <InfoCard session={session} actividad={actividad} />

        {registrado && (
          <div className="bg-green-900/20 border border-green-500/20 rounded-xl
                          px-4 py-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-green-300 font-semibold">
              {success || 'Ya registraste asistencia hoy'}
            </div>
            {registroHoy && (
              <div className="text-green-400/60 text-sm mt-1">
                {registroHoy.estado} · {registroHoy.hora_ingreso?.substring(0, 5)}
              </div>
            )}
          </div>
        )}

        {!registrado && (
          <>
            {actividad.tipo_base === 'guardia' && guardias.length > 0 && (
              <GuardiaSelector guardias={guardias}
                               guardiaId={guardiaId}
                               setGuardiaId={setGuardiaId} />
            )}

            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
              <div className="text-white/40 text-xs font-semibold uppercase
                              tracking-wider mb-3">Estado</div>
              <div className="flex flex-col gap-2">
                {(actividad.estados || []).map(e => (
                  <label key={e}
                         className={`flex items-center gap-3 px-3 py-2.5
                                     rounded-lg border cursor-pointer ${
                           estado === e
                             ? 'border-white/20 bg-white/6'
                             : 'border-white/8 hover:bg-white/4'
                         }`}>
                    <input type="radio" name="estado" value={e}
                           checked={estado === e}
                           onChange={() => setEstado(e)}
                           className="accent-red-600" />
                    <span className="text-white/80 text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
              <div className="text-white/40 text-xs font-semibold uppercase
                              tracking-wider mb-2">
                Observaciones
                <span className="text-white/20 normal-case tracking-normal
                                 font-normal ml-1">(opcional)</span>
              </div>
              <textarea value={observaciones}
                        onChange={e => setObservaciones(e.target.value)}
                        rows={3}
                        placeholder="Agregá una nota si es necesario..."
                        className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                   px-3 py-2.5 text-white placeholder-white/25 text-sm
                                   resize-none focus:outline-none focus:border-white/25" />
            </div>

            {error && <ErrorBox text={error} />}

            <button onClick={handleRegistrar} disabled={loading}
                    className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                               text-white font-semibold py-3.5 rounded-xl text-sm">
              {loading ? 'Registrando...' : '✓ Registrar Asistencia'}
            </button>
          </>
        )}

        {registrado && (
          <button onClick={() => router.push('/home')}
                  className="w-full bg-white/6 hover:bg-white/10 border border-white/8
                             text-white/60 font-medium py-3 rounded-xl text-sm">
            ← Volver al inicio
          </button>
        )}

      </div>
    </PageShell>
  )
}

// ── Componentes auxiliares ──────────────────────────────────────

function InfoCard({ session, actividad }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-0.5 self-stretch rounded-full flex-shrink-0"
             style={{ background: actividad.color }} />
        <div>
          <div className="text-white font-medium">{session.nombre}</div>
          <div className="text-white/40 text-sm">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function GuardiaSelector({ guardias, guardiaId, setGuardiaId }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
      <div className="text-white/40 text-xs font-semibold uppercase
                      tracking-wider mb-3">Guardia</div>
      <div className="flex flex-col gap-2">
        {guardias.map(g => (
          <label key={g.id}
                 className={`flex items-center gap-3 px-3 py-2.5
                             rounded-lg border cursor-pointer ${
                   guardiaId === g.id
                     ? 'border-white/20 bg-white/6'
                     : 'border-white/8 hover:bg-white/4'
                 }`}>
            <input type="radio" name="guardia" value={g.id}
                   checked={guardiaId === g.id}
                   onChange={() => setGuardiaId(g.id)}
                   className="accent-red-600" />
            <span className="text-white/80 text-sm">🚒 {g.nombre}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ text }) {
  return (
    <div className="bg-red-900/20 border border-red-500/20 rounded-xl
                    px-4 py-3 text-red-400 text-sm">
      {text}
    </div>
  )
}
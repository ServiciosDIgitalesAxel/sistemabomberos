'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

// Motivos de ausencia justificada
const MOTIVOS_AJ = [
  'Carpeta médica',
  'Certificado médico',
  'Licencia',
  'Trabajo',
  'Estudio',
  'Otros',
]

// Tipos de eventos del sistema original
const TIPOS_EVENTO = [
  'Reuniones Institucionales',
  'Cursos y Conferencias',
  'Simulacros',
  'Representación y Eventos Sociales',
  'Tareas en el Cuartel',
  'Tareas fuera del Cuartel',
  'Recupero de Guardia',
]

export default function AsistenciaClient({
  session, actividad, guardias, registroHoy, enCurso
}) {
  const router   = useRouter()
  const esEvento = actividad.tipo_base === 'evento'
  const tieneIngresoEgreso = esEvento ||
    (actividad.estados || []).some(e =>
      ['Ingreso', 'Egreso', 'ingreso', 'egreso'].includes(e)
    )

  // Estados generales
  const [estado,        setEstado]        = useState(actividad.estados?.[0] || 'Presente')
  const [guardiaId,     setGuardiaId]     = useState(guardias[0]?.id || '')
  const [observaciones, setObservaciones] = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState('')

  // Ausente justificado
  const [motivoAJ,     setMotivoAJ]     = useState('')
  const [otroMotivo,   setOtroMotivo]   = useState('')

  // Actividades normales
  const [registrado, setRegistrado] = useState(!tieneIngresoEgreso && !!registroHoy)

  // Eventos / ingreso-egreso
  const [eventoEnCurso,    setEventoEnCurso]    = useState(enCurso)
  const [eventoCompletado, setEventoCompletado] = useState(false)
  const [tipoEvento,       setTipoEvento]       = useState('')
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState('')

  const esAusenteJustificado = estado === 'Ausente Justificado'

  // Timer para ingreso en curso
  useEffect(() => {
    if (!tieneIngresoEgreso || !eventoEnCurso?.hora_ingreso) return

    function calcular() {
      try {
        const [anio, mes, dia] = eventoEnCurso.fecha.split('-').map(Number)
        const [h, m, s]        = eventoEnCurso.hora_ingreso.split(':').map(Number)
        const inicio  = new Date(anio, mes - 1, dia, h, m, s)
        const ahora   = new Date()
        const diffMs  = ahora - inicio
        if (diffMs < 0) { setTiempoTranscurrido('0h 0m'); return }
        const horas = Math.floor(diffMs / (1000 * 60 * 60))
        const mins  = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        setTiempoTranscurrido(`${horas}h ${mins}m`)
      } catch { setTiempoTranscurrido('...') }
    }

    calcular()
    const interval = setInterval(calcular, 30000)
    return () => clearInterval(interval)
  }, [eventoEnCurso, tieneIngresoEgreso])

  function getHoraLocal() {
    const ahora = new Date()
    return [
      String(ahora.getHours()).padStart(2, '0'),
      String(ahora.getMinutes()).padStart(2, '0'),
      String(ahora.getSeconds()).padStart(2, '0'),
    ].join(':')
  }

  function getFechaLocal() {
    const ahora = new Date()
    return [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, '0'),
      String(ahora.getDate()).padStart(2, '0'),
    ].join('-')
  }

  function getObservacionFinal() {
    if (esAusenteJustificado) {
      if (!motivoAJ) return observaciones
      if (motivoAJ === 'Otros') return otroMotivo || observaciones
      return motivoAJ + (observaciones ? ` · ${observaciones}` : '')
    }
    return observaciones
  }
function verificarHorario() {
  if (!actividad.hora_inicio || !actividad.hora_fin) return { ok: true }

  const ahora   = new Date()
  const diaSemana = ahora.getDay()
  const dias    = actividad.dias_semana || [0,1,2,3,4,5,6]

  if (!dias.includes(diaSemana)) {
    const nombres = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
    const diasNombres = dias.map(d => nombres[d]).join(', ')
    return { ok: false, msg: `Solo disponible los días: ${diasNombres}` }
  }

  const [hI, mI] = actividad.hora_inicio.split(':').map(Number)
  const [hF, mF] = actividad.hora_fin.split(':').map(Number)
  const minutos  = ahora.getHours() * 60 + ahora.getMinutes()
  const minInicio = hI * 60 + mI
  const minFin    = hF * 60 + mF

  if (minutos < minInicio || minutos > minFin) {
    return {
      ok: false,
      msg: `Registro habilitado de ${actividad.hora_inicio.substring(0,5)} a ${actividad.hora_fin.substring(0,5)}`
    }
  }

  return { ok: true }
}
  // ── Registrar ingreso (eventos/ingreso-egreso) ──────────────
  async function handleRegistrarIngreso() {
    const horario = verificarHorario()
if (!horario.ok) { setError(horario.msg); setLoading(false); return }
    if (esEvento && !tipoEvento) {
      setError('Seleccioná el tipo de evento')
      return
    }
    if (!observaciones.trim() && esEvento) {
      setError('Describí qué hiciste o harás en el evento')
      return
    }
    setLoading(true); setError('')
    try {
      const hora  = getHoraLocal()
      const fecha = getFechaLocal()
      const obs   = esEvento
        ? `[${tipoEvento}] ${observaciones}`
        : observaciones

      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type_id: actividad.id,
          guard_id:         guardiaId || null,
          estado:           'En curso',
          observaciones:    obs,
          fecha,
          hora_ingreso:     hora,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setEventoEnCurso({ id: data.registro.id, fecha, hora_ingreso: hora, observaciones: obs })
      setSuccess(`Ingreso registrado a las ${hora.substring(0, 5)}`)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  // ── Registrar egreso ────────────────────────────────────────
  async function handleRegistrarEgreso() {
    if (!eventoEnCurso) return
    setLoading(true); setError('')
    try {
      const ahora      = new Date()
      const horaEgreso = getHoraLocal()
      const [anio, mes, dia] = eventoEnCurso.fecha.split('-').map(Number)
      const [h, m, s]        = eventoEnCurso.hora_ingreso.split(':').map(Number)
      const inicio  = new Date(anio, mes - 1, dia, h, m, s)
      const diffMs  = ahora - inicio
      const horas   = Math.floor(diffMs / (1000 * 60 * 60))
      const mins    = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const tiempo  = `${horas}h ${mins}m`

      const res = await fetch('/api/asistencia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventoEnCurso.id, hora_egreso: horaEgreso, tiempo_total: tiempo })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setEventoCompletado(true)
      setEventoEnCurso(null)
      setSuccess(
        `Egreso registrado · ${tiempo} · ${eventoEnCurso.hora_ingreso.substring(0,5)} → ${horaEgreso.substring(0,5)}`
      )
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  // ── Registrar actividad normal ──────────────────────────────
  async function handleRegistrar() {
    const horario = verificarHorario()
if (!horario.ok) { setError(horario.msg); setLoading(false); return }
    if (esAusenteJustificado && !motivoAJ) {
      setError('Seleccioná el motivo de la ausencia justificada')
      return
    }
    if (esAusenteJustificado && motivoAJ === 'Otros' && !otroMotivo.trim()) {
      setError('Especificá el motivo')
      return
    }
    setLoading(true); setError('')
    try {
      const hora  = getHoraLocal()
      const fecha = getFechaLocal()
      const res = await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type_id: actividad.id,
          guard_id:         guardiaId || null,
          estado,
          observaciones:    getObservacionFinal(),
          fecha,
          hora_ingreso:     hora,
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(`Asistencia registrada · ${estado} · ${hora.substring(0, 5)}`)
      setRegistrado(true)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  // ════════════════════════════════════════════════════════════
  // RENDER EVENTO / INGRESO-EGRESO
  // ════════════════════════════════════════════════════════════
  if (tieneIngresoEgreso) {
    return (
      <PageShell title={`${actividad.icono} ${actividad.nombre}`}
                 subtitle={session.org_nombre}>
        <div className="max-w-lg mx-auto flex flex-col gap-4">

          <InfoCard session={session} actividad={actividad} />
          {error && <ErrorBox text={error} />}

          {/* Completado */}
          {eventoCompletado && (
            <>
              <div className="bg-green-900/20 border border-green-500/20 rounded-xl
                              px-4 py-6 text-center flex flex-col gap-2">
                <div className="text-4xl">✅</div>
                <div className="text-green-300 font-semibold">{success}</div>
              </div>
              <button onClick={() => router.push('/home')}
                      className="w-full bg-white/6 hover:bg-white/10 border border-white/8
                                 text-white/50 font-medium py-3 rounded-xl text-sm">
                ← Volver al inicio
              </button>
            </>
          )}

          {/* Ingreso en curso → solo egreso */}
          {!eventoCompletado && eventoEnCurso && (
            <>
              <div className="bg-[#0a1830] border border-yellow-500/25 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold uppercase
                                   tracking-wider">
                    Evento en curso
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/50 text-sm">Ingresaste a las</div>
                    <div className="text-white font-bold text-2xl mt-0.5">
                      {eventoEnCurso.hora_ingreso?.substring(0, 5)}
                    </div>
                    <div className="text-white/25 text-xs mt-0.5">
                      {eventoEnCurso.fecha}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/30 text-xs">Tiempo transcurrido</div>
                    <div className="text-yellow-400 font-bold text-3xl mt-0.5">
                      {tiempoTranscurrido || '...'}
                    </div>
                  </div>
                </div>
                {eventoEnCurso.observaciones && (
                  <div className="mt-3 pt-3 border-t border-white/6
                                  text-white/30 text-xs">
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
                                 text-white/50 font-medium py-3 rounded-xl text-sm">
                ← Volver (el evento sigue en curso)
              </button>
            </>
          )}

          {/* Sin ingreso abierto → formulario de ingreso */}
          {!eventoCompletado && !eventoEnCurso && (
            <>
              {/* Tipo de evento — solo si es tipo evento */}
              {esEvento && (
                <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
                  <div className="text-white/40 text-xs font-semibold uppercase
                                  tracking-wider mb-3">
                    Tipo de evento <span className="text-red-400">*</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {TIPOS_EVENTO.map(t => (
                      <label key={t}
                             className={`flex items-center gap-3 px-3 py-2.5
                                         rounded-lg border cursor-pointer ${
                               tipoEvento === t
                                 ? 'border-white/20 bg-white/6'
                                 : 'border-white/8 hover:bg-white/4'
                             }`}>
                        <input type="radio" name="tipoEvento" value={t}
                               checked={tipoEvento === t}
                               onChange={() => setTipoEvento(t)}
                               className="accent-red-600" />
                        <span className="text-white/80 text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {guardias.length > 0 && (
                <GuardiaSelector guardias={guardias}
                                 guardiaId={guardiaId}
                                 setGuardiaId={setGuardiaId} />
              )}

              <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
                <div className="text-white/40 text-xs font-semibold uppercase
                                tracking-wider mb-2">
                  {esEvento ? (
                    <>Descripción <span className="text-red-400">*</span></>
                  ) : (
                    <>Observaciones <span className="text-white/20 normal-case
                                                     tracking-normal font-normal
                                                     ml-1">(opcional)</span></>
                  )}
                </div>
                <textarea value={observaciones}
                          onChange={e => setObservaciones(e.target.value)}
                          rows={3}
                          placeholder={esEvento
                            ? 'Describí qué vas a hacer o qué hiciste...'
                            : 'Agregá una nota si es necesario...'
                          }
                          className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                     px-3 py-2.5 text-white placeholder-white/25 text-sm
                                     resize-none focus:outline-none focus:border-white/25" />
              </div>

              <button onClick={handleRegistrarIngreso} disabled={loading}
                      className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-50
                                 text-white font-semibold py-3.5 rounded-xl text-sm">
                {loading ? 'Registrando...' : '✓ Registrar Ingreso'}
              </button>

              <button onClick={() => router.push('/home')}
                      className="w-full bg-white/6 hover:bg-white/10 border border-white/8
                                 text-white/50 font-medium py-3 rounded-xl text-sm">
                ← Volver
              </button>
            </>
          )}

        </div>
      </PageShell>
    )
  }

  // ════════════════════════════════════════════════════════════
  // RENDER ACTIVIDAD / GUARDIA NORMAL
  // ════════════════════════════════════════════════════════════
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
              <div className="text-green-400/50 text-sm mt-1">
                {registroHoy.estado} · {registroHoy.hora_ingreso?.substring(0, 5)}
                {registroHoy.observaciones && ` · ${registroHoy.observaciones}`}
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

            {/* Selector de estado */}
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
                           onChange={() => { setEstado(e); setMotivoAJ(''); setOtroMotivo('') }}
                           className="accent-red-600" />
                    <span className="text-white/80 text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Motivo ausente justificado */}
            {esAusenteJustificado && (
              <div className="bg-[#0a1830] border border-orange-500/20 rounded-xl p-4">
                <div className="text-orange-400 text-xs font-semibold uppercase
                                tracking-wider mb-3">
                  Motivo <span className="text-red-400">*</span>
                </div>
                <div className="flex flex-col gap-2">
                  {MOTIVOS_AJ.map(m => (
                    <label key={m}
                           className={`flex items-center gap-3 px-3 py-2.5
                                       rounded-lg border cursor-pointer ${
                             motivoAJ === m
                               ? 'border-orange-500/30 bg-orange-900/15'
                               : 'border-white/8 hover:bg-white/4'
                           }`}>
                      <input type="radio" name="motivoAJ" value={m}
                             checked={motivoAJ === m}
                             onChange={() => { setMotivoAJ(m); setOtroMotivo('') }}
                             className="accent-orange-500" />
                      <span className="text-white/80 text-sm">{m}</span>
                    </label>
                  ))}
                </div>

                {/* TextBox si es "Otros" */}
                {motivoAJ === 'Otros' && (
                  <div className="mt-3">
                    <textarea value={otroMotivo}
                              onChange={e => setOtroMotivo(e.target.value)}
                              rows={2}
                              placeholder="Especificá el motivo..."
                              className="w-full bg-[#0d1f38] border border-white/10 rounded-lg
                                         px-3 py-2.5 text-white placeholder-white/25 text-sm
                                         resize-none focus:outline-none focus:border-white/25" />
                  </div>
                )}
              </div>
            )}

            {/* Observaciones generales */}
            <div className="bg-[#0a1830] border border-white/8 rounded-xl p-4">
              <div className="text-white/40 text-xs font-semibold uppercase
                              tracking-wider mb-2">
                Observaciones
                <span className="text-white/20 normal-case tracking-normal
                                 font-normal ml-1">(opcional)</span>
              </div>
              <textarea value={observaciones}
                        onChange={e => setObservaciones(e.target.value)}
                        rows={2}
                        placeholder="Agregá una nota adicional..."
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
                             text-white/50 font-medium py-3 rounded-xl text-sm">
            ← Volver al inicio
          </button>
        )}

      </div>
    </PageShell>
  )
}

// ── Auxiliares ──────────────────────────────────────────────────

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
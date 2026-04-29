'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/ui/PageShell'

const TIPOS = [
  { value: 'actividad', label: '📋 Actividad', desc: 'Ej: Reunión semanal' },
  { value: 'guardia',   label: '🚒 Guardia',   desc: 'Ej: Guardia de sábado' },
  { value: 'evento',    label: '🎯 Evento',     desc: 'Con ingreso y egreso' },
  { value: 'custom',    label: '⚙️ Custom',     desc: 'Tipo personalizado' },
]

const ESTADOS_DEFECTO = {
  actividad: ['Presente', 'Ausente Justificado'],
  guardia:   ['Presente', 'Voluntario', 'Recupero', 'Cubro a', 'Ausente Justificado'],
  evento:    ['Ingreso', 'Egreso'],
  custom:    ['Presente', 'Ausente'],
}

const EMPTY_FORM = {
  nombre: '', icono: '📋', color: '#1a3d7a',
  tipo_base: 'actividad', estados: ['Presente', 'Ausente Justificado'], orden: 0,
  hora_inicio: '', hora_fin: '', dias_semana: [0,1,2,3,4,5,6]
}

export default function ActividadesClient({ actividades: inicial, session }) {
  const router = useRouter()
  const [actividades, setActividades] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function abrirCrear() {
    setForm(EMPTY_FORM); setEditando(null); setShowForm(true); setError('')
  }

  function abrirEditar(a) {
    setForm({
      nombre: a.nombre, icono: a.icono, color: a.color,
      tipo_base: a.tipo_base, estados: a.estados || [], orden: a.orden || 0
    })
    setEditando(a); setShowForm(true); setError('')
  }

  function cambiarTipo(tipo) {
    setForm(f => ({ ...f, tipo_base: tipo, estados: ESTADOS_DEFECTO[tipo] }))
  }

  function agregarEstado() {
    if (!nuevoEstado.trim() || form.estados.includes(nuevoEstado.trim())) return
    setForm(f => ({ ...f, estados: [...f.estados, nuevoEstado.trim()] }))
    setNuevoEstado('')
  }

  function quitarEstado(estado) {
    setForm(f => ({ ...f, estados: f.estados.filter(e => e !== estado) }))
  }

  async function handleGuardar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (form.estados.length === 0) { setError('Debe tener al menos un estado'); return }
    setLoading(true); setError('')
    try {
      const method = editando ? 'PATCH' : 'POST'
      const body   = editando ? { id: editando.id, ...form } : form
      const res = await fetch('/api/admin/actividades', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(editando ? '✅ Actividad actualizada' : '✅ Actividad creada')
      setShowForm(false); setEditando(null)
      const res2 = await fetch('/api/admin/actividades')
      const data2 = await res2.json()
      if (data2.actividades) setActividades(data2.actividades)
    } catch { setError('Error de conexión') }
    finally { setLoading(false) }
  }

  async function toggleActivo(a) {
    const res = await fetch('/api/admin/actividades', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, activo: !a.activo })
    })
    if (res.ok) setActividades(prev => prev.map(x =>
      x.id === a.id ? { ...x, activo: !x.activo } : x
    ))
  }

  return (
    <PageShell
      title="Tipos de Actividad"
      subtitle={session.org_nombre}
      actions={
        <button onClick={abrirCrear}
                className="bg-red-700 hover:bg-red-800 text-white text-sm
                           font-medium px-4 py-2 rounded-lg">
          + Nueva actividad
        </button>
      }
    >
      {error && <Msg type="error" text={error} />}
      {success && <Msg type="success" text={success} />}

      {showForm && (
        <form onSubmit={handleGuardar}
              className="bg-[#0a1830] border border-white/8 rounded-xl p-5
                         flex flex-col gap-4 mb-6">
          <h3 className="text-white font-semibold">
            {editando ? `✏️ Editar: ${editando.nombre}` : '➕ Nueva Actividad'}
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input type="text" value={form.nombre} required
                   onChange={e => setForm({ ...form, nombre: e.target.value })}
                   placeholder="Ej: Reunión Semanal, Guardia Sábado..."
                   className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                              text-white placeholder-white/25 text-sm
                              focus:outline-none focus:border-white/25" />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                Icono (emoji)
              </label>
              <input type="text" value={form.icono}
                     onChange={e => setForm({ ...form, icono: e.target.value })}
                     placeholder="📋"
                     className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                                text-white placeholder-white/25 text-sm text-center text-2xl
                                focus:outline-none focus:border-white/25" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                Color
              </label>
              <input type="color" value={form.color}
                     onChange={e => setForm({ ...form, color: e.target.value })}
                     className="w-16 h-10 rounded-lg border border-white/10
                                bg-transparent cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Tipo Base <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(t => (
                <button key={t.value} type="button" onClick={() => cambiarTipo(t.value)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-sm ${
                          form.tipo_base === t.value
                            ? 'bg-red-900/25 border-red-500/30 text-white'
                            : 'bg-white/4 border-white/8 text-white/60 hover:bg-white/8'
                        }`}>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Estados disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {form.estados.map(e => (
                <span key={e}
                      className="flex items-center gap-1 bg-white/8 text-white/70
                                 text-xs px-2 py-1 rounded-lg">
                  {e}
                  <button type="button" onClick={() => quitarEstado(e)}
                          className="text-white/30 hover:text-red-400 ml-1">✕</button>
                </span>
              ))}
              {/* Restricción de horario */}
<div className="flex flex-col gap-2 border-t border-white/6 pt-4">
  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider">
    Restricción de horario (opcional)
  </label>
  <p className="text-white/25 text-xs">
    Si configurás horario, solo se podrá registrar en ese rango.
    Dejalo vacío para permitir siempre.
  </p>
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-xs">Hora inicio</label>
      <input type="time" value={form.hora_inicio || ''}
             onChange={e => setForm({ ...form, hora_inicio: e.target.value })}
             className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                        text-white text-sm focus:outline-none focus:border-white/25" />
    </div>
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-xs">Hora fin</label>
      <input type="time" value={form.hora_fin || ''}
             onChange={e => setForm({ ...form, hora_fin: e.target.value })}
             className="bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                        text-white text-sm focus:outline-none focus:border-white/25" />
    </div>
  </div>
  <div className="flex flex-col gap-1.5">
    <label className="text-white/40 text-xs">Días habilitados</label>
    <div className="flex gap-2 flex-wrap">
      {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((dia, i) => (
        <label key={i}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           border cursor-pointer text-xs ${
                 (form.dias_semana || [0,1,2,3,4,5,6]).includes(i)
                   ? 'border-white/20 bg-white/8 text-white'
                   : 'border-white/6 bg-transparent text-white/30'
               }`}>
          <input type="checkbox"
                 checked={(form.dias_semana || [0,1,2,3,4,5,6]).includes(i)}
                 onChange={e => {
                   const dias = form.dias_semana || [0,1,2,3,4,5,6]
                   setForm({
                     ...form,
                     dias_semana: e.target.checked
                       ? [...dias, i].sort()
                       : dias.filter(d => d !== i)
                   })
                 }}
                 className="hidden" />
          {dia}
        </label>
      ))}
    </div>
  </div>
</div>
</div>
            <div className="flex gap-2">
              <input type="text" value={nuevoEstado}
                     onChange={e => setNuevoEstado(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarEstado() }}}
                     placeholder="Agregar estado..."
                     className="flex-1 bg-[#0d1f38] border border-white/10 rounded-lg
                                px-3 py-2 text-white placeholder-white/25 text-sm
                                focus:outline-none focus:border-white/25" />
              <button type="button" onClick={agregarEstado}
                      className="bg-white/8 hover:bg-white/12 border border-white/10
                                 text-white/60 px-3 py-2 rounded-lg text-sm">
                + Agregar
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
                    className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50
                               text-white font-semibold py-3 rounded-xl text-sm">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                               text-white/60 font-medium py-3 rounded-xl text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">
        {actividades.length} actividad{actividades.length !== 1 ? 'es' : ''}
      </div>

      <div className="flex flex-col gap-2">
        {actividades.map(a => (
          <div key={a.id}
               className="bg-[#0a1830] border border-white/8 rounded-xl p-4
                          flex items-center gap-3">
            <div className="w-0.5 self-stretch rounded-full flex-shrink-0"
                 style={{ background: a.color }} />
            <div className="text-2xl">{a.icono}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium text-sm">{a.nombre}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  a.activo
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-red-900/40 text-red-400'
                }`}>
                  {a.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="text-white/30 text-xs mt-0.5">
                {a.tipo_base} · {(a.estados || []).join(', ')}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => abrirEditar(a)}
                      className="bg-white/8 hover:bg-white/12 border border-white/8
                                 text-white/60 text-xs px-3 py-1.5 rounded-lg">
                ✏️
              </button>
              <button onClick={() => toggleActivo(a)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        a.activo
                          ? 'bg-red-900/20 border-red-500/20 text-red-400'
                          : 'bg-green-900/20 border-green-500/20 text-green-400'
                      }`}>
                {a.activo ? '⛔' : '✅'}
              </button>
            </div>
          </div>
        ))}
        {actividades.length === 0 && <Empty text="No hay actividades creadas todavía" />}
      </div>
    </PageShell>
  )
}

function Msg({ type, text }) {
  const s = type === 'error'
    ? 'bg-red-900/20 border-red-500/20 text-red-400'
    : 'bg-green-900/20 border-green-500/20 text-green-400'
  return <div className={`border rounded-xl px-4 py-3 text-sm mb-4 ${s}`}>{text}</div>
}

function Empty({ text }) {
  return (
    <div className="bg-[#0a1830] border border-white/8 rounded-xl p-8
                    text-center text-white/30 text-sm">{text}</div>
  )
}
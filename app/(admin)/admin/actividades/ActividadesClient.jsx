'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIPOS = [
  { value: 'actividad', label: '📋 Actividad', desc: 'Ej: Reunión semanal, Jueves' },
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
  tipo_base: 'actividad', estados: ['Presente', 'Ausente Justificado'], orden: 0
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
    setForm(EMPTY_FORM)
    setEditando(null)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function abrirEditar(a) {
    setForm({
      nombre:    a.nombre,
      icono:     a.icono,
      color:     a.color,
      tipo_base: a.tipo_base,
      estados:   a.estados || [],
      orden:     a.orden || 0
    })
    setEditando(a)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  function cambiarTipo(tipo) {
    setForm(f => ({ ...f, tipo_base: tipo, estados: ESTADOS_DEFECTO[tipo] }))
  }

  function agregarEstado() {
    if (!nuevoEstado.trim()) return
    if (form.estados.includes(nuevoEstado.trim())) return
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
    setLoading(true)
    setError('')

    try {
      const method = editando ? 'PATCH' : 'POST'
      const body = editando ? { id: editando.id, ...form } : form

      const res = await fetch('/api/admin/actividades', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      setSuccess(editando ? '✅ Actividad actualizada' : '✅ Actividad creada')
      setShowForm(false)
      setEditando(null)

      const res2 = await fetch('/api/admin/actividades')
      const data2 = await res2.json()
      if (data2.actividades) setActividades(data2.actividades)

    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActivo(a) {
    const res = await fetch('/api/admin/actividades', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, activo: !a.activo })
    })
    if (res.ok) {
      setActividades(prev => prev.map(x =>
        x.id === a.id ? { ...x, activo: !x.activo } : x
      ))
    }
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">

      <div className="bg-[#841616] px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/home')}
                className="bg-white/10 hover:bg-white/20 border border-white/20
                           text-white text-xs font-semibold px-3 py-2 rounded-lg">
          ← Volver
        </button>
        <div className="flex-1">
          <div className="text-white font-bold text-base">Tipos de Actividad</div>
          <div className="text-white/60 text-xs">{session.org_nombre}</div>
        </div>
        <button onClick={abrirCrear}
                className="bg-white/15 hover:bg-white/25 border border-white/20
                           text-white text-xs font-bold px-3 py-2 rounded-lg">
          + Nueva
        </button>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm">
            {success}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleGuardar}
                className="bg-[#0a1830] border border-white/10 rounded-xl p-5 flex flex-col gap-4">

            <h3 className="text-white font-bold text-lg">
              {editando ? `✏️ Editar: ${editando.nombre}` : '➕ Nueva Actividad'}
            </h3>

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Nombre *
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
                placeholder="Ej: Reunión Semanal, Guardia Sábado..."
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white placeholder-white/30 text-sm
                           focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Icono y color */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  Icono (emoji)
                </label>
                <input
                  type="text"
                  value={form.icono}
                  onChange={e => setForm({ ...form, icono: e.target.value })}
                  placeholder="📋"
                  className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                             text-white placeholder-white/30 text-sm text-center text-2xl
                             focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                  Color
                </label>
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-16 h-10 rounded-lg border border-white/10
                             bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Tipo Base *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => cambiarTipo(t.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      form.tipo_base === t.value
                        ? 'bg-[#b01e1e]/30 border-[#b01e1e]/60 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8'
                    }`}
                  >
                    <div className="font-bold">{t.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estados */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Estados disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {form.estados.map(e => (
                  <span key={e}
                        className="flex items-center gap-1 bg-white/10 text-white
                                   text-xs px-2 py-1 rounded-lg">
                    {e}
                    <button type="button" onClick={() => quitarEstado(e)}
                            className="text-white/50 hover:text-red-400 ml-1">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoEstado}
                  onChange={e => setNuevoEstado(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarEstado() }}}
                  placeholder="Agregar estado..."
                  className="flex-1 bg-white/8 border border-white/10 rounded-lg px-3 py-2
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:border-white/30"
                />
                <button type="button" onClick={agregarEstado}
                        className="bg-white/10 hover:bg-white/20 border border-white/10
                                   text-white px-3 py-2 rounded-lg text-sm">
                  + Agregar
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                      className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                                 text-white font-bold py-3 rounded-xl transition-all">
                {loading ? '⏳ Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                                 text-white/70 font-bold py-3 rounded-xl">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="text-white/40 text-xs font-bold uppercase tracking-wider">
          {actividades.length} actividad{actividades.length !== 1 ? 'es' : ''}
        </div>

        <div className="flex flex-col gap-3">
          {actividades.map(a => (
            <div key={a.id}
                 className="bg-[#0a1830] border border-white/10 rounded-xl p-4
                            flex items-center gap-3">
              <div className="w-1 self-stretch rounded-full flex-shrink-0"
                   style={{ background: a.color }} />
              <div className="text-2xl">{a.icono}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{a.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    a.activo
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-red-900/40 text-red-400'
                  }`}>
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="text-white/40 text-xs mt-1">
                  {a.tipo_base} · {(a.estados || []).join(', ')}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => abrirEditar(a)}
                        className="bg-white/8 hover:bg-white/15 border border-white/10
                                   text-white/70 text-xs px-3 py-1.5 rounded-lg">
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

          {actividades.length === 0 && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-8
                            text-center text-white/40 text-sm">
              No hay actividades creadas todavía
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CuartelesClient({ cuarteles: inicial, session }) {
  const router = useRouter()
  const [cuarteles, setCuarteles] = useState(inicial)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#b01e1e')
  const [adminNombre, setAdminNombre] = useState('')
  const [adminJerarquia, setAdminJerarquia] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  async function handleCrear(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/superadmin/cuarteles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          color,
          adminNombre,
          adminJerarquia,
          adminUsername,
          adminPassword,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear el cuartel')
        return
      }

      setSuccess(`✅ Cuartel "${nombre}" creado correctamente`)
      setShowForm(false)
      setNombre('')
      setColor('#b01e1e')
      setAdminNombre('')
      setAdminJerarquia('')
      setAdminUsername('')
      setAdminPassword('')
      setCuarteles([data.cuartel, ...cuarteles])

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
          <div className="text-white font-bold text-base">Gestionar Cuarteles</div>
          <div className="text-white/60 text-xs">Super Administrador</div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 flex flex-col gap-4">

        {/* Mensajes */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl
                          px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl
                          px-4 py-3 text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Botón crear */}
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setSuccess('') }}
            className="w-full bg-[#b01e1e] hover:bg-[#d42828] text-white
                       font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            + Crear Nuevo Cuartel
          </button>
        )}

        {/* Formulario */}
        {showForm && (
          <form
            onSubmit={handleCrear}
            className="bg-[#0a1830] border border-white/10 rounded-xl p-5
                       flex flex-col gap-4"
          >
            <h3 className="text-white font-bold text-lg">Nuevo Cuartel</h3>

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Nombre del Cuartel *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                placeholder="Ej: Bomberos Villa del Rosario"
                className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                           text-white placeholder-white/30 text-sm
                           focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1">
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                Color Principal
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-white/10
                             bg-transparent cursor-pointer"
                />
                <span className="text-white/50 text-sm">{color}</span>
              </div>
            </div>

            {/* Datos admin */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white/80 font-bold text-sm mb-3">
                👤 Datos del Administrador
              </h4>

              <div className="flex flex-col gap-3">

                <div className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={adminNombre}
                    onChange={e => setAdminNombre(e.target.value)}
                    required
                    placeholder="Nombre del administrador"
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white placeholder-white/30 text-sm
                               focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Jerarquía
                  </label>
                  <input
                    type="text"
                    value={adminJerarquia}
                    onChange={e => setAdminJerarquia(e.target.value)}
                    placeholder="Ej: Jefe de Bomberos"
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white placeholder-white/30 text-sm
                               focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    required
                    placeholder="Nombre de usuario para login"
                    autoComplete="off"
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white placeholder-white/30 text-sm
                               focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    autoComplete="new-password"
                    className="bg-white/8 border border-white/10 rounded-lg px-3 py-2.5
                               text-white placeholder-white/30 text-sm
                               focus:outline-none focus:border-white/30"
                  />
                </div>

              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50
                           text-white font-bold py-3 rounded-xl transition-all"
              >
                {loading ? '⏳ Creando...' : 'Crear Cuartel'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-white/8 hover:bg-white/12 border border-white/10
                           text-white/70 font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>

          </form>
        )}

        {/* Lista cuarteles */}
        <div className="flex flex-col gap-3">
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">
            Cuarteles registrados ({cuarteles.length})
          </h3>

          {cuarteles.length === 0 && (
            <div className="bg-white/4 border border-white/8 rounded-xl p-8
                            text-center text-white/40 text-sm">
              No hay cuarteles creados todavía
            </div>
          )}

          {cuarteles.map(c => (
            <div
              key={c.id}
              className="bg-[#0a1830] border border-white/10 rounded-xl p-4
                         flex items-center gap-3"
            >
              <div
                className="w-3 h-10 rounded-full flex-shrink-0"
                style={{ background: c.color_primario }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{c.nombre}</div>
                <div className="text-white/40 text-xs mt-0.5">
                  {c.activa ? '✅ Activo' : '⛔ Inactivo'} ·{' '}
                  {new Date(c.created_at).toLocaleDateString('es-AR')}
                </div>
              </div>
              <button
                onClick={() => router.push(`/superadmin/cuarteles/${c.id}`)}
                className="bg-white/8 hover:bg-white/15 border border-white/10
                           text-white/70 text-xs font-semibold px-3 py-2 rounded-lg"
              >
                Ver →
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
      router.push('/home')
      router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-red-700 px-5 py-5 text-center">
        <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
             className="w-14 h-14 object-contain mx-auto mb-2" />
        <div className="text-white font-semibold text-base">
          Bomberos Voluntarios
        </div>
        <div className="text-red-200 text-sm mt-0.5">
          Sistema de Asistencias
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8
                      max-w-sm mx-auto w-full">

        <h1 className="text-gray-900 text-2xl font-bold mb-1">
          Iniciá sesión
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Ingresá tus credenciales para continuar
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700 text-sm font-medium">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              required
              className="border border-gray-300 rounded-lg px-3 py-2.5
                         text-gray-900 placeholder-gray-400 text-sm bg-white
                         focus:outline-none focus:border-gray-500 focus:ring-1
                         focus:ring-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700 text-sm font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5
                           pr-10 text-gray-900 placeholder-gray-400 text-sm bg-white
                           focus:outline-none focus:border-gray-500 focus:ring-1
                           focus:ring-gray-500"
              />
              <button type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-gray-400 hover:text-gray-600 text-sm">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg
                            px-3 py-2.5 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
                  className="bg-red-700 hover:bg-red-800 disabled:opacity-50
                             text-white font-semibold text-sm py-3 rounded-lg
                             with-transition mt-1">
            {loading ? 'Verificando...' : 'Ingresar al sistema'}
          </button>

        </form>

        <div className="flex items-center gap-2 mt-6 text-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-gray-400 text-xs">Sistema operativo</span>
        </div>

      </div>

      <div className="text-center pb-6 text-gray-400 text-xs">
        Bomberos Voluntarios · Sistema de Asistencias
      </div>
    </div>
  )
}
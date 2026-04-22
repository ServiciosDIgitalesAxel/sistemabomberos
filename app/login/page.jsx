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

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }

      router.push('/home')
      router.refresh()

    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col">
      
      {/* Header */}
      <div className="bg-[#841616] px-5 py-6 text-center shadow-lg">
        <div className="text-white font-bold text-lg leading-tight">
          Sistema de Asistencias
        </div>
        <div className="text-white/70 text-sm mt-1">
          Bomberos Voluntarios
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        
        <h1 className="text-white text-3xl font-bold text-center mb-2">
          Iniciá sesión
        </h1>
        <p className="text-white/50 text-center text-sm mb-8">
          Ingresá tus credenciales para continuar
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          {/* Usuario */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              required
              className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 
                         text-white placeholder-white/30 text-base
                         focus:outline-none focus:border-yellow-400/50 
                         focus:bg-white/12 transition-all"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 
                           pr-12 text-white placeholder-white/30 text-base
                           focus:outline-none focus:border-yellow-400/50 
                           focus:bg-white/12 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 
                           text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl 
                            px-4 py-3 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#b01e1e] hover:bg-[#d42828] disabled:opacity-50 
                       disabled:cursor-not-allowed text-white font-bold text-base
                       py-4 rounded-xl transition-all mt-2
                       shadow-lg shadow-red-900/30"
          >
            {loading ? '⏳ Verificando...' : 'Ingresar al sistema'}
          </button>

        </form>

        {/* Status */}
        <div className="flex items-center gap-2 mt-6 bg-white/4 border border-white/6 
                        rounded-xl px-4 py-3 justify-center">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/50 text-xs">Sistema operativo · Acceso seguro</span>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-white/20 text-xs">
        Sistema de Asistencias · Bomberos Voluntarios
      </div>

    </div>
  )
}
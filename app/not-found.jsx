'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col items-center
                    justify-center px-5 text-center">
      <div className="text-8xl mb-6">🚒</div>
      <h1 className="text-white font-bold text-4xl mb-2">404</h1>
      <p className="text-white/50 text-lg mb-8">
        Esta página no existe o no tenés acceso
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push('/home')}
          className="w-full bg-[#b01e1e] hover:bg-[#d42828] text-white
                     font-bold py-3.5 rounded-xl transition-all"
        >
          🏠 Ir al inicio
        </button>
        <button
          onClick={() => router.back()}
          className="w-full bg-white/8 hover:bg-white/12 border border-white/10
                     text-white/70 font-bold py-3.5 rounded-xl transition-all"
        >
          ← Volver
        </button>
      </div>
    </div>
  )
}
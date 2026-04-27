'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center
                    justify-center px-5 text-center">
      <div className="text-6xl mb-4">🚒</div>
      <h1 className="text-gray-900 font-bold text-3xl mb-2">404</h1>
      <p className="text-gray-500 text-base mb-8">
        Esta página no existe o no tenés acceso
      </p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button onClick={() => router.push('/home')}
                className="w-full bg-red-700 hover:bg-red-800 text-white
                           font-semibold py-3 rounded-xl text-sm with-transition">
          Ir al inicio
        </button>
        <button onClick={() => router.back()}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50
                           text-gray-700 font-medium py-3 rounded-xl text-sm
                           with-transition">
          ← Volver
        </button>
      </div>
    </div>
  )
}
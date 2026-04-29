'use client'

import { useState, useEffect } from 'react'

export default function PushManager() {
  const [estado, setEstado] = useState('idle') // idle | pidiendo | activo | denegado | noSoportado
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setEstado('noSoportado')
      return
    }

    if (Notification.permission === 'granted') {
      setEstado('activo')
    } else if (Notification.permission === 'denied') {
      setEstado('denegado')
    } else {
      // Mostrar el banner después de 3 segundos
      setTimeout(() => setMostrar(true), 3000)
    }
  }, [])

  async function suscribir() {
    setEstado('pidiendo')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setEstado('denegado')
        setMostrar(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        )
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() })
      })

      setEstado('activo')
      setMostrar(false)

      // Notificación de bienvenida
      new Notification('¡Notificaciones activadas! 🔔', {
        body: 'Te avisaremos cuando haya novedades en el sistema.',
        icon: '/icons/icon-192x192.png',
      })

    } catch (err) {
      console.error('Error suscribiendo:', err)
      setEstado('idle')
    }
  }

  function rechazar() {
    setMostrar(false)
    try { localStorage.setItem('push_rechazado', '1') } catch {}
  }

  // No mostrar si ya rechazó antes
  useEffect(() => {
    try {
      if (localStorage.getItem('push_rechazado') === '1') setMostrar(false)
    } catch {}
  }, [])

  if (!mostrar || estado === 'activo' || estado === 'noSoportado') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-6
                    lg:w-80 z-50">
      <div className="bg-[#0a1830] border border-white/12 rounded-2xl p-4
                      shadow-xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">🔔</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm mb-1">
              Activar notificaciones
            </div>
            <div className="text-white/50 text-xs leading-relaxed">
              Te avisamos cuando se habilita el registro y cuando hay novedades del cuartel.
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={suscribir} disabled={estado === 'pidiendo'}
                  className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50
                             text-white font-semibold py-2.5 rounded-xl text-sm">
            {estado === 'pidiendo' ? 'Activando...' : 'Activar'}
          </button>
          <button onClick={rechazar}
                  className="flex-1 bg-white/6 hover:bg-white/10 border border-white/10
                             text-white/50 font-medium py-2.5 rounded-xl text-sm">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  const output  = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
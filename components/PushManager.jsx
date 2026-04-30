'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output  = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export default function PushManager() {
  const [estado,  setEstado]  = useState('idle')
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    // No soportado
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }

    // Ya rechazó antes
    try {
      if (localStorage.getItem('push_rechazado') === '1') return
    } catch {}

    if (Notification.permission === 'granted') {
      setEstado('activo')
      return
    }

    if (Notification.permission === 'denied') {
      setEstado('denegado')
      return
    }

    // Mostrar banner después de 4 segundos
    const t = setTimeout(() => setMostrar(true), 4000)
    return () => clearTimeout(t)
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

      // Esperar a que el SW esté listo
      const reg = await navigator.serviceWorker.ready

      // Verificar soporte de push
      if (!reg.pushManager) {
        console.error('PushManager no disponible')
        setEstado('idle')
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('VAPID key no configurada')
        setEstado('idle')
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() })
      })

      if (!res.ok) throw new Error('Error guardando suscripción')

      setEstado('activo')
      setMostrar(false)

    } catch (err) {
      console.error('Error activando push:', err)
      setEstado('idle')
      setMostrar(false)
    }
  }

  function rechazar() {
    setMostrar(false)
    try { localStorage.setItem('push_rechazado', '1') } catch {}
  }

  if (!mostrar || estado === 'activo' || estado === 'denegado') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-50">
      <div className="bg-[#0a1830] border border-white/12 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-700/20 border border-red-500/20
                          flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="#f87171" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">
              Activar notificaciones
            </div>
            <div className="text-white/50 text-xs mt-1 leading-relaxed">
              Recibí alertas cuando se habilita el registro y novedades del cuartel.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
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
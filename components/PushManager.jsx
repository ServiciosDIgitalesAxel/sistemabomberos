'use client'

import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  const arr     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export default function PushManager() {
  const [mostrar, setMostrar] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (
      !('Notification' in window) ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) return

    try {
      if (localStorage.getItem('push_rechazado') === '1') return
    } catch {}

    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') return

    const t = setTimeout(() => setMostrar(true), 3000)
    return () => clearTimeout(t)
  }, [])

  async function activar() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setMostrar(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidKey) {
        console.error('Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY')
        setMostrar(false)
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      const res = await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON() })
      })

      if (!res.ok) throw new Error('Error al guardar suscripción')

      setMostrar(false)

      // Notificación de bienvenida
      await fetch('/api/push/bienvenida', { method: 'POST' })

    } catch (err) {
      console.error('Push error:', err)
      setMostrar(false)
    } finally {
      setLoading(false)
    }
  }

  function rechazar() {
    setMostrar(false)
    try { localStorage.setItem('push_rechazado', '1') } catch {}
  }

  if (!mostrar) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-6
                    lg:w-80 z-50">
      <div className="bg-[#0a1830] border border-white/12 rounded-2xl p-4
                      shadow-xl shadow-black/50">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-700/20 border border-red-500/20
                          flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#f87171" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold text-sm">
              Activar notificaciones
            </div>
            <div className="text-white/50 text-xs mt-1 leading-relaxed">
              Te avisamos cuando se habilita el registro y cuando hay
              novedades en el cuartel.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={activar} disabled={loading}
                  className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-60
                             text-white font-semibold py-2.5 rounded-xl text-sm">
            {loading ? 'Activando...' : 'Activar'}
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
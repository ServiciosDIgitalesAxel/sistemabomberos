'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('SW registrado:', reg.scope)
        })
        .catch(err => {
          console.error('SW error:', err)
        })
    }
  }, [])

  return null
}
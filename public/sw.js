self.addEventListener('push', function(event) {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body:    data.body || '',
    icon:    data.icon || '/icons/icon-192x192.png',
    badge:   '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data:    { url: data.url || '/' },
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sistema Bomberos', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
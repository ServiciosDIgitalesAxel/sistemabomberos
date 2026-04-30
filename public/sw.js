self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('push', event => {
  if (!event.data) return
  let data
  try { data = event.data.json() }
  catch { data = { title: 'Sistema Bomberos', body: event.data.text() } }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sistema Bomberos', {
      body:    data.body || '',
      icon:    '/icons/icon-192x192.png',
      badge:   '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/home' }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/home'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus()
      return clients.openWindow(url)
    })
  )
})
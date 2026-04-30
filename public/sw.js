const CACHE_NAME = 'bomberos-v1'
const STATIC_ASSETS = [
  '/',
  '/home',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json',
]

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network first para APIs, cache first para assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // No cachear APIs ni requests de other origins
  if (url.pathname.startsWith('/api/') || url.origin !== location.origin) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Sistema Bomberos', body: event.data.text() }
  }

  const options = {
    body:    data.body  || '',
    icon:    data.icon  || '/icons/icon-192x192.png',
    badge:   '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag:     data.tag   || 'bomberos-notif',
    renotify: true,
    data:    { url: data.url || '/home' },
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sistema Bomberos', options)
  )
})

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/home'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          if ('focus' in client) return client.focus()
        }
        return clients.openWindow(url)
      })
  )
})
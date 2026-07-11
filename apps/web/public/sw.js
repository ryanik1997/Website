// Service worker: push notifications only.
// Catalog MP3 is NOT intercepted here.
// Firefox: SW fetch + large media files can throw NS_ERROR_INTERCEPTION_FAILED.
// Browser loads /catalog/... mp3 files directly from Vite/static.

const CATALOG_CACHE_PREFIX = 'ryan-catalog-'

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Clear old catalog audio caches (previous cache-first strategy)
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter(key => key.startsWith(CATALOG_CACHE_PREFIX))
        .map(key => caches.delete(key)),
    )
    await self.clients.claim()
  })())
})

// No fetch handler for catalog audio — avoids Firefox interception failures

self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Ryan English', {
      body: data.body ?? 'Ban co the can on hom nay!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'srs-reminder',
      renotify: true,
      data: { url: data.url ?? '/app/vocab' },
    }),
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const url = event.notification.data?.url ?? '/app/vocab'
      const target = new URL(url, self.location.origin).href
      const existing = list.find(c => c.url.startsWith(self.location.origin))
      if (existing) {
        return existing.focus().then(c => {
          if ('navigate' in c) return c.navigate(target)
          return undefined
        })
      }
      return clients.openWindow(target)
    }),
  )
})

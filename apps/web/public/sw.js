/* Service worker: push notifications + cache catalog audio offline (cache-first). */
/* __CATALOG_CACHE_VERSION__ replaced at build — see vite.config.ts */

const CATALOG_CACHE_PREFIX = 'ryan-catalog-'
const RAW_CATALOG_CACHE_VERSION = '__CATALOG_CACHE_VERSION__'
const CATALOG_CACHE_VERSION = RAW_CATALOG_CACHE_VERSION.startsWith('__')
  ? 'dev'
  : RAW_CATALOG_CACHE_VERSION
const CATALOG_CACHE_NAME = `${CATALOG_CACHE_PREFIX}${CATALOG_CACHE_VERSION}`

const CATALOG_MEDIA_RE = /\.(mp3|m4a|wav|ogg|webm)$/i

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter(key => key.startsWith(CATALOG_CACHE_PREFIX) && key !== CATALOG_CACHE_NAME)
        .map(key => caches.delete(key)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isCatalogAudio = url.origin === self.location.origin
    && url.pathname.startsWith('/catalog/')
    && CATALOG_MEDIA_RE.test(url.pathname)

  if (!isCatalogAudio) return

  event.respondWith(cacheFirstCatalog(request))
})

async function cacheFirstCatalog(request) {
  const cache = await caches.open(CATALOG_CACHE_NAME)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok && response.type === 'basic') {
    try {
      await cache.put(request, response.clone())
    } catch (err) {
      console.warn('[sw] catalog cache put failed', err)
    }
  }
  return response
}

self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Ryan English', {
      body: data.body ?? 'Bạn có thẻ cần ôn hôm nay!',
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
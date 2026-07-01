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
    })
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
    })
  )
})
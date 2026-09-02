/* SpliceFlow Lab — basic app-shell service worker. Honest cache, not a full offline DB. */
const CACHE = 'spliceflow-lab-shell-v0'
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/offline',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => cache.addAll(['/', '/index.html', '/manifest.webmanifest', '/icon.svg'])))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req)
        const cache = await caches.open(CACHE)
        if (fresh.ok && req.url.startsWith(self.location.origin)) {
          cache.put(req, fresh.clone()).catch(() => {})
        }
        return fresh
      } catch {
        const cached = await caches.match(req)
        if (cached) return cached
        if (req.mode === 'navigate') {
          const shell = (await caches.match('/index.html')) || (await caches.match('/'))
          if (shell) return shell
          const offline = await caches.match('/offline')
          if (offline) return offline
        }
        return new Response('SpliceFlow Lab offline — enclosure form may still be cached.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      }
    })()
  )
})

// ElevateHours service worker.
// Keeps the app installable and shows an offline page when there's no network.
// It never caches Supabase, API calls or logged-in pages, so data is always fresh.
const CACHE = 'eh-shell-v1'
const OFFLINE_URL = '/offline.html'
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // Supabase etc. go straight to the network

  // Page navigations: network first, offline page if it fails
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  // Static icons: cache first
  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)))
  }
})

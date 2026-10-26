// Testing portal service worker: makes the site installable and shows an
// offline page when there's no connection. It never caches API data or
// pages -- everything here is live (and OTP codes must not sit in a cache).
const CACHE = 'testing-shell-v3'
const SHELL = ['/offline.html', '/icon-192.png', '/logo-icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  // The offline page's own files (its logo), from the cache
  if (url.origin === self.location.origin && SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname).then((hit) => hit || fetch(request)))
    return
  }
  // Page loads: go to the network, fall back to the offline page
  if (request.mode !== 'navigate') return
  // no-store: never a stale copy from the browser's own cache either;
  // manual redirects so the sign-in redirect still reaches the page
  event.respondWith(
    fetch(request.url, { cache: 'no-store', credentials: 'same-origin', redirect: 'manual' }).catch(() =>
      caches.match('/offline.html'),
    ),
  )
})

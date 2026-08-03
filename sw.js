// Expedition 11 — service worker
// Purpose: (1) satisfy PWA installability requirements, (2) let the app open
// instantly + offline on repeat visits by caching the app shell.
// Deliberately conservative: only same-origin requests are cached. Anything
// cross-origin (Firebase, MathJax CDN, jsPDF, html2canvas, Tesseract, fonts)
// is left alone and just goes to the network as normal, so none of that
// live/dynamic behavior is affected.

const CACHE_VERSION = 'expedition11-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests for our own origin. Everything else (CDN
  // scripts, Firebase calls, POSTs, etc.) passes straight through untouched.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // Network-first for the HTML shell so users always get the latest build
  // when online, with a cached fallback so the app still opens offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first for static same-origin assets (icons, manifest, etc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});

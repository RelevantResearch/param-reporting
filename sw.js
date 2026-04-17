// Service Worker — network-first, versioned cache bust
// Bump CACHE_VERSION on every deployment to force clients to clear old caches
const CACHE_VERSION = "v20260417";
const CACHE_NAME = `detention-reports-${CACHE_VERSION}`;

// On install: skip waiting so the new SW activates immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// On activate: delete every cache that doesn't match the current version
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// On fetch: try the network first; only fall back to cache when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin / CDN assets
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone and store the fresh response in the current cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(() =>
        // Network failed — serve from cache (offline fallback)
        caches.match(event.request)
      )
  );
});

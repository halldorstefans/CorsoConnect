// public/service-worker.js

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("engineer-a-car-tracker-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/styles/globals.css",
        "/_next/static/chunks/main.js",
        "/_next/static/chunks/framework.js",
        // Add other assets you want to cache
      ]);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available, otherwise fetch from network
      return cachedResponse || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = ["engineer-a-car-tracker-cache"];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

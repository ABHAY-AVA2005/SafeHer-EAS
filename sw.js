const CACHE_NAME = 'safeher-cache-v3'; // Version 3 to force immediate update
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
  // Removed external links (fonts, audio) to prevent CORS errors
  // Removed icons because the folder is missing in your repo
];

// Install event: Caches only the files we know exist
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] CRITICAL FAIL - Check your file paths:', err);
      })
  );
});

// Fetch event: Serves from cache, falls back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Hit cache
        }
        return fetch(event.request); // Fallback to network
      })
  );
});

// Activate event: Clears old broken caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

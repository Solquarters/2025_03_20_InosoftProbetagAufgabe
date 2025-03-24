// Name of the cache
const CACHE_NAME = 'task-manager-v1';

// Files to cache
const RESOURCES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Service worker installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(RESOURCES_TO_CACHE);
      })
      .then(() => {
        // Activate the service worker immediately
        return self.skipWaiting();
      })
  );
});

// Service worker activation
self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients/tabs immediately
      return self.clients.claim();
    })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from cache
        if (response) {
          return response;
        }
        
        // Not in cache - fetch from network
        return fetch(event.request)
          .then((response) => {
            // Return the response immediately to user
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();

            // Add the new resource to cache for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (offline), return a fallback or nothing
            // For API requests, you might want a specific offline response
            if (event.request.url.includes('api')) {
              return new Response(JSON.stringify({ error: 'You are offline' }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
          });
      })
  );
});
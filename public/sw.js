// Pandactory Service Worker
const CACHE_NAME = 'pandactory-v1.4.0';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/ui/logo.png',
  '/assets/backgrounds/bg_dashboard.jpg',
  '/assets/backgrounds/bg_lush_forest.jpg',
  '/assets/backgrounds/bg_misty_lake.jpg',
  '/assets/backgrounds/bg_arid_desert.jpg',
  '/assets/backgrounds/bg_frozen_tundra.jpg',
  '/assets/backgrounds/bg_volcanic_isle.jpg',
  '/assets/backgrounds/bg_crystal_caverns.jpg',
  '/assets/backgrounds/bg_skills_stats.jpg',
  '/assets/sprites/expedition_panda.png',
  '/assets/sprites/Spaceship.png',
  '/assets/sprites/Spaceship_Panda.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Precache failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // For navigation requests, try network first (for SPA routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the new version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached index.html for offline
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update cache in background
          event.waitUntil(
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, response);
                  });
                }
              })
              .catch(() => {
                // Network failed, that's fine - we have cache
              })
          );
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback for images
            if (request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50" x="50" text-anchor="middle">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

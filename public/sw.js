console.log('Service Worker: Script loaded');

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Take control of all clients immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up any old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Service Worker: Cleaning up old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);
  // For now, just pass through all requests
  event.respondWith(fetch(event.request));
});

// Message event for debugging
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 
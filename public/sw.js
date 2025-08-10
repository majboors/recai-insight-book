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
  event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);
  // For now, just pass through all requests
  event.respondWith(fetch(event.request));
}); 
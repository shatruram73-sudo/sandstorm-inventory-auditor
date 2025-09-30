// Service Worker for Offline Caching
const CACHE_NAME = 'sandstorm-auditor-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
    // Firebase service calls cannot be cached, but the scripts can be.
];

// Install event: Caches all necessary assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching assets...');
                // Note: The / index route is typically resolved as /index.html
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: Intercepts network requests
self.addEventListener('fetch', (event) => {
    // Only intercept requests for files we explicitly want to cache (HTML, CSS, JS libraries)
    // Firestore requests must go to the network, so we let them pass through.
    if (urlsToCache.some(url => event.request.url.includes(url.replace('/', '')))) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    // No cache hit - fetch from network
                    return fetch(event.request);
                })
        );
    } else {
         // Allow all other requests (like Firebase API calls) to go directly to the network
        return;
    }
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
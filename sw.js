// Service Worker PWA Étape 5
const CACHE_NAME = 'gdev-portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/Ressource/Logo.webp',
  '/Ressource/Logo.png',
  '/Ressource/zikzone 2.webp',
  '/Ressource/zikzone 2.png',
  '/Ressource/WhatsApp Image 2026-03-08 at 17.02.55.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

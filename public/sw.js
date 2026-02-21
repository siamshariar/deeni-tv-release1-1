// /public/sw.js - Empty service worker to prevent 404 errors
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Just pass through all fetch requests
  event.respondWith(fetch(event.request));
});
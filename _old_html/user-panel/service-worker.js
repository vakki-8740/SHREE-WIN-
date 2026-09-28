const CACHE_NAME = 'shree-win-user-v2';
const urlsToCache = [
    './',
    './index.html',
    './contact.html',
    './deposite.html',
    './withdrawal.html',
    './CHAT PAGE/chat.html',
    './style.css',
    './script.js',
    './CHAT PAGE/chat.js',
    './firebase-config.js',
    './manifest.json',
    './LOGO/images__1_-removebg-preview.png',
    './icons/DEPOSITE-removebg-preview.png',
    './icons/WITHDRWAL-removebg-preview.png',
    './icons/ONLINE-CHAT-removebg-preview.png',
    './BANNER/photo_2026-09-26_13-03-37.jpg'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', function (event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

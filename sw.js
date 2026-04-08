// ====================== ONESIGNAL (должен быть первым) ======================
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// ====================== WORKBOX ======================
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "gkh-cache-v4";
const offlineFallbackPage = "index.html";

workbox.setConfig({ debug: false });

// ==================== КЭШИРОВАНИЕ ====================

// 1. Статические файлы (стили, скрипты, изображения, шрифты) — быстрое открытие
workbox.routing.registerRoute(
    ({ request }) => 
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font',
    new workbox.strategies.CacheFirst()
);

// 2. Навигация (HTML страницы) — сначала сеть, потом кэш + предзагрузка
workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
        cacheName: CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 30,
            })
        ]
    })
);

// ==================== УСТАНОВКА И АКТИВАЦИЯ ====================

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => {
            return cache.addAll([
                offlineFallbackPage,
                './',
                './index.html',
                './master.html',
                './dispatcher.html',
                './boss.html',
                './styles.css'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

if (workbox.navigationPreload.isSupported()) {
    workbox.navigationPreload.enable();
}

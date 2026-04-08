// === ПОДКЛЮЧАЕМ ONESIGNAL В НАШ PWA ===
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'gkh-cache-v4';

// При установке приложения кэшируем главный экран и стили
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './master.html',
                './dispatcher.html',
                './styles.css'
            ]);
        })
    );
    self.skipWaiting(); // ← ВАЖНО ДЛЯ TWA
});

// Активируем Service Worker для всех вкладок сразу
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // ← ВАЖНО ДЛЯ TWA
});

// Если нет интернета - пытаемся отдать закэшированную версию
self.addEventListener('fetch', (event) => {
    // Пропускаем запросы OneSignal (они должны идти напрямую)
    if (event.request.url.includes('onesignal.com')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// === ПОДКЛЮЧАЕМ ONESIGNAL В НАШ PWA ===
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'gkh-cache-v5';

// При установке приложения кэшируем главный экран и стили
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './index.html',
                './styles.css'
            ]);
        })
    );
});

// Если нет интернета - пытаемся отдать закэшированную версию
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

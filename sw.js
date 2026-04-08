// ====================== ONESIGNAL (должен быть первым) ======================
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE = "gkh-cache-v4";
const offlineFallbackPage = "offline.html"; // ← Теперь сюда

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './master.html',
                './dispatcher.html',
                './boss.html',
                './styles.css',
                './offline.html' // ← Кэшируем offline страницу
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Пропускаем запросы OneSignal
    if (event.request.url.includes('onesignal.com')) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResp = await fetch(event.request);
                // Кэшируем страницу где был пользователь
                const cache = await caches.open(CACHE);
                cache.put(event.request, networkResp.clone());
                return networkResp;
            } catch (error) {
                // Пробуем отдать закэшированную версию текущей страницы
                const cache = await caches.open(CACHE);
                const cachedPage = await cache.match(event.request);
                if (cachedPage) {
                    return cachedPage; // ← Остаётся на своей странице!
                }
                // Если страницы нет в кэше — показываем offline.html
                return await cache.match(offlineFallbackPage);
            }
        })());
        return;
    }

    // Для статических файлов
    event.respondWith(
        caches.match(event.request).then((cachedResp) => {
            return cachedResp || fetch(event.request).then((networkResp) => {
                return caches.open(CACHE).then((cache) => {
                    cache.put(event.request, networkResp.clone());
                    return networkResp;
                });
            });
        })
    );
});

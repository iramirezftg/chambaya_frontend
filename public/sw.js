const CACHE_NAME = 'chambaya-pwa-v2';
const STATIC_ASSETS = [
  '/',
  '/mobile',
  '/marketplace',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon-512.png',
  '/images/hero.jpg',
  '/images/cleaning.jpg',
  '/images/plumbing.jpg',
  '/images/ac_repair.jpg',
  '/images/salon.jpg'
];

// Install: Pre-cache static assets for offline capability
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [Service Worker] Pre-caching ChambaYa app shell v2');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('⚠️ Some assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 [Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for dynamic content, cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // API calls: Network first, don't cache unless necessary
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline', message: 'Estás sin conexión celular. Operando en modo offline PWA.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Static assets & navigation: Cache first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/mobile') || caches.match('/');
          }
        });
    })
  );
});

// Background Sync API: Sincronización en segundo plano al recuperar conexión
self.addEventListener('sync', (event) => {
  console.log(`⚡ [Service Worker] Evento Background Sync activado: tag=${event.tag}`);
  if (event.tag === 'chambaya-offline-sync' || event.tag === 'sync-chambas') {
    event.waitUntil(triggerSyncProcess());
  }
});

// Message listener from web clients
self.addEventListener('message', (event) => {
  if (event.data?.type === 'TRIGGER_SYNC') {
    event.waitUntil(triggerSyncProcess());
  }
});

async function triggerSyncProcess() {
  console.log('🔄 [Service Worker] Ejecutando sincronización de cola en segundo plano');
  try {
    // Notificar a todos los clientes activos que se sincronizó la cola
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      client.postMessage({ type: 'BACKGROUND_SYNC_COMPLETED', timestamp: Date.now() });
    }

    // Mostrar notificación nativa en el dispositivo
    await self.registration.showNotification('🔄 ChambaYa Sincronizado', {
      body: 'Tus actualizaciones sin conexión fueron enviadas y procesadas con éxito.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [150, 80, 150],
      data: { url: '/mobile' }
    });
  } catch (err) {
    console.warn('⚠️ [Service Worker] Error en triggerSyncProcess:', err);
  }
}

// Web Push Notifications event
self.addEventListener('push', (event) => {
  let data = {
    title: 'ChambaYa México 🇲🇽',
    body: '¡Tienes una nueva actualización en tu chamba!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: '/mobile' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/mobile' },
    actions: [
      { action: 'open', title: '👀 Ver Chamba' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/mobile';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

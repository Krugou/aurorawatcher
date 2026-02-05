/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Workbox precaching
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Claims clients immediately
self.skipWaiting();
clientsClaim();

// SPA navigation - use NetworkFirst for index.html
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'pages-cache',
    }),
  ),
);

// Aurora data URL
const AURORA_DATA_URL =
  'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';

// Color definitions for HIGH activity (matches auroraUtils.ts)
const HIGH_COLOR = { red: 238, green: 102, blue: 119 }; // #EE6677

/**
 * Check if aurora image has HIGH activity
 */
async function checkAuroraActivity(): Promise<boolean> {
  try {
    const response = await fetch(`${AURORA_DATA_URL}?t=${Date.now()}`);
    if (!response.ok) return false;

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    const data = imageData.data;

    // Check for HIGH color
    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] === HIGH_COLOR.red &&
        data[i + 1] === HIGH_COLOR.green &&
        data[i + 2] === HIGH_COLOR.blue
      ) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error('[SW] Failed to check aurora activity:', e);
    return false;
  }
}

/**
 * Show notification for aurora activity
 */
async function showAuroraNotification(savedStation: string | null): Promise<void> {
  const title = savedStation
    ? `🌌 ${savedStation.toUpperCase()}: HIGH ACTIVITY!`
    : '🌌 Aurora Alert!';

  await self.registration.showNotification(title, {
    body: 'High magnetic activity detected. Great aurora viewing conditions!',
    icon: '/aurorawatcher/pwa-192x192.png',
    badge: '/aurorawatcher/pwa-192x192.png',
    tag: 'aurora-alert',
    data: {
      url: '/aurorawatcher/',
    },
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const urlToOpen = (event.notification.data as { url?: string })?.url || '/aurorawatcher/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('aurorawatcher') && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new tab
      return self.clients.openWindow(urlToOpen);
    }),
  );
});

// Periodic background sync (if supported)
interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
}

self.addEventListener('periodicsync', ((event: PeriodicSyncEvent) => {
  if (event.tag === 'aurora-check') {
    event.waitUntil(
      (async () => {
        const hasActivity = await checkAuroraActivity();
        if (hasActivity) {
          await showAuroraNotification(null);
        }
      })(),
    );
  }
}) as EventListener);

// Message handler for manual checks from the app
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'CHECK_AURORA') {
    event.waitUntil(
      (async () => {
        const hasActivity = await checkAuroraActivity();
        if (hasActivity) {
          await showAuroraNotification(event.data.savedStation || null);
        }
        // Respond to the client
        event.ports[0]?.postMessage({ hasActivity });
      })(),
    );
  }
});

console.log('[SW] Custom service worker loaded with aurora notifications');

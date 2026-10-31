/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

import { fetchStationFeed, getStationsMissingFromFeed } from './services/stationFeed';
import { scanStationPixels, type StationStatus } from './utils/auroraUtils';
import {
  DEFAULT_NOTIFY_PREFS,
  getTriggeredStations,
  type NotifyPrefs,
} from './utils/notificationPrefs';

declare let self: ServiceWorkerGlobalScope;

// Workbox precaching
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches(); // Auto-cleanup old caches

// Claims clients immediately
void self.skipWaiting();
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

const PREFS_CACHE = 'aurora-prefs';
const PREFS_URL = '/aurorawatcher/__notify-prefs.json';

async function savePrefs(prefs: NotifyPrefs): Promise<void> {
  const cache = await caches.open(PREFS_CACHE);
  await cache.put(PREFS_URL, new Response(JSON.stringify(prefs)));
}

async function loadPrefs(): Promise<NotifyPrefs> {
  try {
    const cache = await caches.open(PREFS_CACHE);
    const res = await cache.match(PREFS_URL);
    if (res) return { ...DEFAULT_NOTIFY_PREFS, ...((await res.json()) as Partial<NotifyPrefs>) };
  } catch (e) {
    console.warn('[SW] Failed to load notification prefs:', e);
  }
  return { ...DEFAULT_NOTIFY_PREFS };
}

const FEED_COLORS = {
  QUIET: '#D7D7D7',
  LOW: '#66CCEE',
  MODERATE: '#228833',
  HIGH: '#EE6677',
} as const;

/** Reads the given stations (all when `only` is undefined) from the FMI map image. */
async function scanMapImage(only?: string[]): Promise<StationStatus[]> {
  try {
    const response = await fetch(`${AURORA_DATA_URL}?t=${Date.now()}`);
    if (!response.ok) return [];

    const bitmap = await createImageBitmap(await response.blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    return scanStationPixels(data, bitmap.width, bitmap.height, only);
  } catch (e) {
    console.error('[SW] Failed to read aurora map image:', e);
    return [];
  }
}

/**
 * Returns the stations whose activity matches the user's notification prefs. The open
 * magnetometer feed is authoritative; the map image only covers stations the feed lacks (or
 * every station if the feed fails).
 */
async function checkAuroraActivity(prefs: NotifyPrefs): Promise<string[]> {
  const statuses: StationStatus[] = [];
  let imageStations: string[] | undefined;
  try {
    const series = await fetchStationFeed(6);
    statuses.push(
      ...series.map((s) => ({ name: s.name, status: s.status, color: FEED_COLORS[s.status] })),
    );
    imageStations = getStationsMissingFromFeed(series);
  } catch (e) {
    console.warn('[SW] Magnetometer feed unavailable, falling back to map image:', e);
  }
  if (imageStations?.length !== 0) statuses.push(...(await scanMapImage(imageStations)));
  return getTriggeredStations(statuses, prefs);
}

/**
 * Show notification for aurora activity
 */
async function showAuroraNotification(stations: string[], title?: string, body?: string) {
  await self.registration.showNotification(
    title ?? `🌌 ${stations.slice(0, 3).join(', ').toUpperCase()}: aurora activity!`,
    {
      body: body ?? 'High magnetic activity detected. Great aurora viewing conditions!',
      icon: '/aurorawatcher/pwa-192x192.png',
      badge: '/aurorawatcher/pwa-192x192.png',
      tag: 'aurora-alert',
      data: {
        url: '/aurorawatcher/',
      },
    },
  );
}

// Web Push: show payloads sent by a push service (title/body JSON or plain text)
self.addEventListener('push', (event: PushEvent) => {
  let title: string | undefined;
  let body: string | undefined;
  try {
    const json = event.data?.json() as { title?: string; body?: string } | undefined;
    title = json?.title;
    body = json?.body;
  } catch {
    body = event.data?.text();
  }
  event.waitUntil(showAuroraNotification([], title ?? '🌌 Aurora Alert!', body));
});
// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const urlToOpen = (event.notification.data as { url?: string } | null)?.url ?? '/aurorawatcher/';

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
        const stations = await checkAuroraActivity(await loadPrefs());
        if (stations.length > 0) {
          await showAuroraNotification(stations);
        }
      })(),
    );
  }
}) as EventListener);

interface AuroraMessage {
  type: string;
  prefs?: NotifyPrefs;
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data as AuroraMessage | undefined;
  if (data?.type === 'SET_NOTIFY_PREFS' && data.prefs) {
    event.waitUntil(savePrefs(data.prefs));
  } else if (data?.type === 'CHECK_AURORA') {
    event.waitUntil(
      (async () => {
        const prefs = data.prefs ?? (await loadPrefs());
        const stations = await checkAuroraActivity(prefs);
        if (stations.length > 0) {
          await showAuroraNotification(stations);
        }
        event.ports[0]?.postMessage({ hasActivity: stations.length > 0, stations });
      })(),
    );
  }
});

console.log('[SW] Custom service worker loaded with aurora notifications');

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Analytics } from '../utils/analytics';

interface NotificationPermissionProps {
  savedStation: string | null;
}

export const NotificationPermission = ({ savedStation }: NotificationPermissionProps) => {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;

    setIsRegistering(true);
    Analytics.trackNotificationPermission('requested');
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        Analytics.trackNotificationPermission('granted');
        // Register for periodic sync if supported
        if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          try {
            // @ts-expect-error - periodicSync is not in the types yet
            await registration.periodicSync.register('aurora-check', {
              minInterval: 15 * 60 * 1000, // 15 minutes
            });
            console.log('Periodic sync registered');
          } catch (e) {
            console.warn('Periodic sync not available:', e);
          }
        }
      }
    } catch (e) {
      console.error('Failed to request notification permission:', e);
    } finally {
      setIsRegistering(false);
    }
  };

  const testNotification = async () => {
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      console.log('Aurora check result:', event.data);
    };

    registration.active?.postMessage({ type: 'CHECK_AURORA', savedStation }, [
      messageChannel.port2,
    ]);
  };

  // Don't show if notifications are unsupported or already granted
  if (permission === 'unsupported') return null;
  if (permission === 'granted') {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-aurora-teal/5 border border-aurora-teal/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <span className="text-xs font-mono font-medium text-white/70">
            {t('notifications.enabled')}
          </span>
        </div>
        <button
          onClick={testNotification}
          className="text-xs font-mono font-medium text-aurora-teal bg-aurora-teal/10 px-3 py-1 rounded-lg border border-aurora-teal/20 hover:bg-aurora-teal/20 transition-colors duration-300"
        >
          {t('common.test', 'TEST')}
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔕</span>
          <span className="text-xs font-mono font-medium text-white/70">
            {t('notifications.blocked')}
          </span>
        </div>
        <p className="text-[10px] font-mono text-white/30 mt-1">
          {t('notifications.blocked_hint')}
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      disabled={isRegistering}
      className="w-full p-4 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-blue text-white hover:shadow-[0_0_25px_rgba(0,212,170,0.3)] transition-all duration-300 disabled:opacity-50"
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">🔔</span>
        <div className="text-left">
          <div className="font-bold font-mono">{t('notifications.enable')}</div>
          <div className="text-xs font-mono opacity-70">
            {savedStation
              ? t('notifications.for_station', { station: savedStation })
              : t('notifications.for_any')}
          </div>
        </div>
      </div>
    </button>
  );
};

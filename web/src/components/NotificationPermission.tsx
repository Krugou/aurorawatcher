import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
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
      <div className="flex items-center justify-between p-3 bg-neo-mint/20 border-2 border-black dark:border-white">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <span className="text-xs font-mono font-bold text-black dark:text-white uppercase">
            {t('notifications.enabled', 'NOTIFICATIONS ON')}
          </span>
        </div>
        <button
          onClick={testNotification}
          className="text-xs font-mono font-bold text-black bg-neo-yellow px-2 py-1 border border-black hover:bg-yellow-400 transition-colors"
        >
          TEST
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-3 bg-neo-pink/20 border-2 border-black dark:border-white">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔕</span>
          <span className="text-xs font-mono font-bold text-black dark:text-white uppercase">
            {t('notifications.blocked', 'NOTIFICATIONS BLOCKED')}
          </span>
        </div>
        <p className="text-[10px] font-mono text-gray-500 mt-1">
          {t('notifications.blocked_hint', 'Enable in browser settings')}
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      disabled={isRegistering}
      className="w-full p-4 bg-neo-blue text-white border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">🔔</span>
        <div className="text-left">
          <div className="font-bold font-mono uppercase">
            {t('notifications.enable', 'ENABLE AURORA ALERTS')}
          </div>
          <div className="text-xs font-mono opacity-80">
            {savedStation
              ? t('notifications.for_station', {
                  station: savedStation,
                  defaultValue: 'For {{station}} station',
                })
              : t('notifications.for_any', 'For any high activity')}
          </div>
        </div>
      </div>
    </button>
  );
};

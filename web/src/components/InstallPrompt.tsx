import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InstallChoice {
  outcome: 'accepted' | 'dismissed';
  platform: string;
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

export const InstallPrompt = () => {
  const { t } = useTranslation();
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch {
      setInstallError(true);
    } finally {
      setInstallEvent(null);
      setInstalling(false);
    }
  };

  if (installed) return null;

  return installEvent ? (
    <>
      <button
        type="button"
        className="control-button install-button"
        onClick={install}
        disabled={installing}
      >
        {installing ? t('pwa.installing') : t('pwa.install')}
      </button>
      {installError && (
        <span className="install-error" role="status">
          {t('pwa.installFailed')}
        </span>
      )}
    </>
  ) : (
    <details className="install-help">
      <summary className="control-button">{t('pwa.install')}</summary>
      <p>{t('pwa.manualInstall')}</p>
    </details>
  );
};

import { useTranslation } from 'react-i18next';

import { useTheme } from '../hooks/useTheme';

export const HighContrastToggle = () => {
  const { t } = useTranslation();
  const { highContrast, toggleHighContrast } = useTheme();

  return (
    <button
      type="button"
      aria-pressed={highContrast}
      aria-label={highContrast ? t('contrast.disable') : t('contrast.enable')}
      title={highContrast ? t('contrast.disable') : t('contrast.enable')}
      onClick={toggleHighContrast}
      className="control-button"
    >
      <span aria-hidden="true">◐</span>
    </button>
  );
};

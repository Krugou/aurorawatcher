import { useTranslation } from 'react-i18next';

import { Analytics } from '../utils/analytics';

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fi' : 'en';
    i18n.changeLanguage(newLang);
    Analytics.trackLanguageChange(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="control-button language-button"
      aria-label={t('common.switch_lang')}
    >
      <span className="flex items-center gap-1.5">
        {i18n.language === 'en' && (
          <span className="flex items-center gap-1.5">
            <span className="text-base">🇫🇮</span>
            <span>{t('common.fi_label', { defaultValue: 'FI' })}</span>
          </span>
        )}
        {i18n.language !== 'en' && (
          <span className="flex items-center gap-1.5">
            <span className="text-base">🇬🇧</span>
            <span>{t('common.en_label', { defaultValue: 'EN' })}</span>
          </span>
        )}
      </span>
    </button>
  );
};

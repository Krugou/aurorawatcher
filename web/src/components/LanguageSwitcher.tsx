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
      className="flex items-center justify-center h-10 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-aurora-blue/20 hover:border-aurora-blue/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300 cursor-pointer font-medium font-mono text-sm"
      aria-label={t('common.switch_lang')}
    >
      <span className="flex items-center gap-1.5">
        {i18n.language === 'en' ? (
          <>
            <span className="text-base">🇫🇮</span>
            <span>{t('common.fi_label', 'FI')}</span>
          </>
        ) : (
          <>
            <span className="text-base">🇬🇧</span>
            <span>{t('common.en_label', 'EN')}</span>
          </>
        )}
      </span>
    </button>
  );
};

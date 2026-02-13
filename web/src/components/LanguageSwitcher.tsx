import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center h-12 w-16 bg-white dark:bg-black hover:bg-neo-blue dark:hover:bg-neo-blue hover:text-white dark:hover:text-white text-black dark:text-white border-2 border-black dark:border-white shadow-neo dark:shadow-neo-dark transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer font-bold font-mono"
      aria-label={t('common.switch_lang')}
    >
      <span className="flex items-center gap-2">
        {i18n.language === 'en' ? (
          <>
            <span className="text-xl">🇫🇮</span>
            <span>FI</span>
          </>
        ) : (
          <>
            <span className="text-xl">🇬🇧</span>
            <span>EN</span>
          </>
        )}
      </span>
    </button>
  );
};

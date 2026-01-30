import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-md border border-slate-700 text-sm font-medium transition-colors cursor-pointer"
      aria-label="Switch Language"
    >
      {i18n.language === 'en' ? '🇫🇮 FI' : '🇬🇧 EN'}
    </button>
  );
};

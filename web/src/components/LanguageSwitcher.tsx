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
      className="flex items-center justify-center h-10 px-3 bg-slate-800/60 hover:bg-slate-700/80 text-white rounded-xl border border-slate-700/50 text-xs font-bold transition-friendly backdrop-blur-md cursor-pointer hover-lift shadow-lg"
      aria-label="Switch Language"
    >
      <span className="flex items-center gap-2">
        {i18n.language === 'en' ? (
            <><span>🇫🇮</span><span>FI</span></>
        ) : (
            <><span>🇬🇧</span><span>EN</span></>
        )}
      </span>
    </button>
  );
};

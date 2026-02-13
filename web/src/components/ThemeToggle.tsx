import { useTranslation } from 'react-i18next';

import { useTheme } from '../hooks/useTheme';
import { Analytics } from '../utils/analytics';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    toggleTheme();
    Analytics.trackThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center h-12 w-12 bg-white dark:bg-black hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-white dark:hover:text-black border-2 border-black dark:border-white shadow-neo dark:shadow-neo-dark transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
      aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {theme === 'dark' ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={3}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={3}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

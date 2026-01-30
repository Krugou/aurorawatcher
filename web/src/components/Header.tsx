import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t } = useTranslation();
  return (
    <header className="text-center py-8">
      <h1 className="text-5xl font-bold bg-linear-to-r from-green-500 to-blue-600 dark:from-green-400 dark:to-blue-500 bg-clip-text text-transparent mb-2">
        {t('app.title')}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg transition-colors">
        {t('header.subtitle')}
      </p>
    </header>
  );
};

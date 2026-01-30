import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fi from './locales/fi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fi: { translation: fi },
    },
    fallbackLng: 'fi', // Fallback to Finnish if language not detected
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;

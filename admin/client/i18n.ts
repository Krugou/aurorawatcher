import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          title: 'AuroraWatcher Admin',
          camId: 'Camera ID',
          timestamp: 'Timestamp',
          actions: 'Actions',
          delete: 'Delete',
          deleteConfirm: 'Are you sure you want to delete this image?',
          lastUpdated: 'Last Updated',
          refresh: 'Refresh',
          empty: 'No history entries found.',
          errorLoading: 'Error loading history data.',
          deleted: 'Entry deleted successfully.',
          failedDelete: 'Failed to delete entry.',
          filterByCam: 'Filter by Camera',
          cloudScore: 'Cloud Score',
          onlyCloudy: 'Only Cloudy',
          allImages: 'All Images'
        }
      },
      fi: {
        translation: {
          title: 'AuroraWatcher Hallinta',
          camId: 'Kameran ID',
          timestamp: 'Aikaleima',
          actions: 'Toiminnot',
          delete: 'Poista',
          deleteConfirm: 'Oletko varma, että haluat poistaa tämän kuvan?',
          lastUpdated: 'Viimeksi päivitetty',
          refresh: 'Päivitä',
          empty: 'Historiaa ei löytynyt.',
          errorLoading: 'Virhe ladattaessa historiatietoja.',
          deleted: 'Merkintä poistettu onnistuneesti.',
          failedDelete: 'Merkinnän poisto epäonnistui.',
          filterByCam: 'Suodata kameran mukaan',
          cloudScore: 'Pilvisyys',
          onlyCloudy: 'Vain pilviset',
          allImages: 'Kaikki kuvat'
        }
      }
    }
  });

export default i18n;

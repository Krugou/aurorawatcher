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
          allImages: 'All Images',
          status: 'Status',
          version: 'Version',
          uptime: 'Uptime',
          entries: 'entries',
          galleryEyebrow: 'ADMIN CURATION',
          galleryTitle: 'Aurora color gallery',
          galleryDescription: 'Each scan checks the latest observatory images and saves the 30 strongest aurora-color matches, ranked strongest first.',
          galleryScan: 'Scan latest {{count}} images',
          galleryScanning: 'Scanning archive…',
          galleryProgress: 'Checked {{current}} of {{total}} · {{found}} matches',
          galleryScanComplete: 'Saved {{found}} matches from {{scanned}} images.',
          galleryScanFailed: 'Aurora image scan failed.',
          galleryLoadFailed: 'Failed to load the saved gallery.',
          gallerySaveFailed: 'Failed to save the gallery.',
          gallerySaved: 'Gallery updated.',
          galleryKeepList: 'Saved gallery images',
          gallerySavedCount: '{{count}} saved images',
          galleryEmpty: 'No aurora images saved yet. Scan the recent archive to find matches.',
          galleryScore: 'Color {{score}}%',
          galleryRemove: 'Remove'
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
          allImages: 'Kaikki kuvat',
          status: 'Tila',
          version: 'Versio',
          uptime: 'Käyntiaika',
          entries: 'merkintää',
          galleryEyebrow: 'HALLINNAN KURATOINTI',
          galleryTitle: 'Revontulivärien galleria',
          galleryDescription: 'Jokainen haku tarkistaa observatorioiden uusimmat kuvat ja tallentaa 30 vahvinta revontulivärien osumaa järjestyksessä.',
          galleryScan: 'Etsi uusimmista {{count}} kuvasta',
          galleryScanning: 'Käydään arkistoa läpi…',
          galleryProgress: 'Tarkistettu {{current}} / {{total}} · {{found}} osumaa',
          galleryScanComplete: 'Tallennettiin {{found}} osumaa {{scanned}} kuvasta.',
          galleryScanFailed: 'Revontulikuvien haku epäonnistui.',
          galleryLoadFailed: 'Tallennetun gallerian lataus epäonnistui.',
          gallerySaveFailed: 'Gallerian tallennus epäonnistui.',
          gallerySaved: 'Galleria päivitetty.',
          galleryKeepList: 'Tallennetut gallerian kuvat',
          gallerySavedCount: '{{count}} tallennettua kuvaa',
          galleryEmpty: 'Revontulikuvia ei ole vielä tallennettu. Etsi osumia tuoreesta arkistosta.',
          galleryScore: 'Väri {{score}} %',
          galleryRemove: 'Poista'
        }
      }
    }
  });

export default i18n;

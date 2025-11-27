import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fi from './locales/fi.json';
import de from './locales/de.json';
import sv from './locales/sv.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  fi: { translation: fi },
  de: { translation: de },
  sv: { translation: sv },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

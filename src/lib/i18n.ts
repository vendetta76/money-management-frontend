import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/clean_en.json';
import id from '@/locales/clean_id.json';
import es from '@/locales/clean_es.json';
import zh from '@/locales/clean_zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
      es: { translation: es },
      zh: { translation: zh },
    },
    lng: 'en', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

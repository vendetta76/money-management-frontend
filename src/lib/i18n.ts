import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/clean_en.json';
import id from '@/locales/clean_id.json';
import es from '@/locales/clean_es.json';
import zh from '@/locales/clean_zh.json';

const savedLang = localStorage.getItem('lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id },
      es: { translation: es },
      zh: { translation: zh },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

// Simpan perubahan bahasa ke localStorage setiap kali user mengganti bahasa
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
});

export default i18n;
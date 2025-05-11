
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './en/common.json';
import frCommon from './fr/common.json';
import arCommon from './ar/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
      },
      fr: {
        common: frCommon,
      },
      ar: {
        common: arCommon,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

// Function to change language and update HTML dir attribute for RTL
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  
  // Set RTL direction for Arabic
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
};

export default i18n;

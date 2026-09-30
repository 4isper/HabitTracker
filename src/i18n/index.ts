import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ru } from './locales/ru';

export const DEFAULT_LOCALE = 'ru';

export const resources = {
  [DEFAULT_LOCALE]: {
    translation: ru,
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    resources,
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)[typeof DEFAULT_LOCALE];
  }
}
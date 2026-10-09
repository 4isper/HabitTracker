import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { findBestLanguageTag } from 'react-native-localize';

import {
  DEFAULT_LOCALE,
  resources,
  SUPPORTED_LOCALES,
} from './locales';

import type { LanguageDetectorModule } from 'i18next';

/**
 * Device locale is the single source of truth. Nothing is cached to storage:
 * persisting the detected value would pin the language forever and silently
 * ignore a later system language change.
 *
 * On Android 13+ and iOS 14+ the platform per-app language picker
 * (`android:localeConfig`, `CFBundleLocalizations`) feeds this same signal.
 */
const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: () =>
    findBestLanguageTag(SUPPORTED_LOCALES)?.languageTag ?? DEFAULT_LOCALE,
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).use(languageDetector).init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    nonExplicitSupportedLngs: true,
    resources,
    interpolation: {
      escapeValue: false,
    },
  });
}

export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales';

export default i18n;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)[typeof DEFAULT_LOCALE];
  }
}
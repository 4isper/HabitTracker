import { en } from './en';
import { es } from './es';
import { hi } from './hi';
import { id } from './id';
import { pt } from './pt';
import { ru } from './ru';

export const DEFAULT_LOCALE = 'ru';

export const SUPPORTED_LOCALES = ['ru', 'en', 'id', 'es', 'pt', 'hi'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const resources = {
  ru: {
    translation: ru,
  },
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
  es: {
    translation: es,
  },
  pt: {
    translation: pt,
  },
  hi: {
    translation: hi,
  },
} as const;

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}
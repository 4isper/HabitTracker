/**
 * @format
 */

let mockDeviceLocales: Array<{ languageTag: string; isRTL?: boolean }> = [];

jest.mock('react-native-localize', () => ({
  findBestLanguageTag: (tags: readonly string[]) => {
    for (const locale of mockDeviceLocales) {
      const languageTag = locale.languageTag;

      if (tags.includes(languageTag)) {
        return { languageTag, isRTL: Boolean(locale.isRTL) };
      }

      const base = languageTag.split('-')[0];

      if (tags.includes(base)) {
        return { languageTag: base, isRTL: Boolean(locale.isRTL) };
      }
    }

    return undefined;
  },
}));

type I18nModule = typeof import('../src/i18n');

type I18nInstance = I18nModule['default'];

function bootWithDeviceLocales(
  locales: Array<{ languageTag: string }>,
): I18nInstance {
  mockDeviceLocales = locales;

  jest.resetModules();

  const module = require('../src/i18n') as I18nModule;

  return module.default;
}

describe('language detection', () => {
  it('picks Russian for a Russian device', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'ru-RU' }]);

    expect(i18n.language).toBe('ru');
  });

  it('picks English for an English device', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'en-US' }]);

    expect(i18n.language).toBe('en');
    expect(i18n.t('home.title')).toBe('My habits');
  });

  it('picks Indonesian for an Indonesian device', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'id-ID' }]);

    expect(i18n.language).toBe('id');
    expect(i18n.t('home.title')).toBe('Kebiasaan Saya');
  });

  it('picks Spanish for a Latin American device', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'es-MX' }]);

    expect(i18n.language).toBe('es');
    expect(i18n.t('home.title')).toBe('Mis hábitos');
  });

  it('picks Portuguese for a Brazilian device', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'pt-BR' }]);

    expect(i18n.language).toBe('pt');
    expect(i18n.t('home.title')).toBe('Meus hábitos');
  });

  it('picks Hindi for an Indian device', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'hi-IN' }]);

    expect(i18n.language).toBe('hi');
    expect(i18n.t('home.title')).toBe('मेरी आदतें');
  });

  it('falls back to the base language for an unknown region', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'en-GB' }]);

    expect(i18n.language).toBe('en');
  });

  it('respects device preference order', () => {
    const i18n = bootWithDeviceLocales([
      { languageTag: 'ru' },
      { languageTag: 'en' },
    ]);

    expect(i18n.language).toBe('ru');
  });

  it('falls back to the default locale when nothing matches', () => {
    const i18n = bootWithDeviceLocales([{ languageTag: 'de-DE' }]);

    expect(i18n.language).toBe('ru');
    expect(i18n.t('home.title')).toBe('Мои привычки');
  });

  it('falls back to the default locale when the device reports nothing', () => {
    const i18n = bootWithDeviceLocales([]);

    expect(i18n.language).toBe('ru');
  });
});
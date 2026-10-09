/**
 * @format
 */

import i18n from '../src/i18n';
import { ru } from '../src/i18n/locales/ru';
import { resources, SUPPORTED_LOCALES } from '../src/i18n/locales';

type Tree = { [key: string]: string | Tree };

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [`${prefix}${key}`]
      : flatten(value, `${prefix}${key}.`),
  );
}

function collectValues(tree: Tree): string[] {
  return Object.entries(tree).flatMap(([, value]) =>
    typeof value === 'string' ? [value] : collectValues(value),
  );
}

function setLanguage(lng: string): Promise<unknown> {
  return i18n.changeLanguage(lng);
}

afterEach(() => setLanguage('ru'));

describe('locale bundles', () => {
  it('defines the same non-plural keys in every supported locale', () => {
    const baseKeys = SUPPORTED_LOCALES.map(locale =>
      flatten(resources[locale].translation as Tree)
        .filter(key => !PLURAL_SUFFIX.test(key))
        .sort(),
    );

    const reference = baseKeys[0];

    for (const keys of baseKeys) {
      expect(keys).toEqual(reference);
    }

    expect(reference.length).toBeGreaterThan(0);
  });

  it('gives every locale the universal plural fallback', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(flatten(resources[locale].translation as Tree)).toContain(
        'habitDetails.statDays_other',
      );
    }
  });

  it('gives Russian the paucal and genitive forms its grammar requires', () => {
    const russianKeys = flatten(ru as Tree);

    expect(russianKeys).toContain('habitDetails.statDays_few');
    expect(russianKeys).toContain('habitDetails.statDays_many');
  });

  it('has no empty translations', () => {
    const blanks: string[] = [];

    for (const locale of SUPPORTED_LOCALES) {
      collectValues(resources[locale].translation as Tree).forEach(value => {
        if (value.trim().length === 0) {
          blanks.push(locale);
        }
      });
    }

    expect(blanks).toEqual([]);
  });

  it('keeps the Russian bundle free of untranslated English copy', () => {
    const leaked = collectValues(ru as Tree).filter(value =>
      /^[A-Za-z0-9 ,.'!?-]{6,}$/.test(value),
    );

    expect(leaked).toEqual([]);
  });

  it('keeps Cyrillic out of every non-Russian bundle', () => {
    for (const locale of SUPPORTED_LOCALES.filter(item => item !== 'ru')) {
      const leaked = collectValues(resources[locale].translation as Tree).filter(
        value => /[Ѐ-ӿ]/.test(value),
      );

      expect({ locale, leaked }).toEqual({ locale, leaked: [] });
    }
  });

  it('interpolates the same placeholders in every locale', () => {
    const placeholders = (tree: Tree, prefix = ''): string[] =>
      Object.entries(tree).flatMap(([key, value]) => {
        const name = `${prefix}${key}`.replace(PLURAL_SUFFIX, '');

        if (typeof value === 'string') {
          const found = value.match(/\{\{(\w+)\}\}/g) ?? [];

          return found.length > 0 ? [`${name}:${found.sort().join(',')}`] : [];
        }

        return placeholders(value, `${name}.`);
      });

    const unique = (tree: Tree) => [...new Set(placeholders(tree))].sort();
    const reference = unique(ru as Tree);

    for (const locale of SUPPORTED_LOCALES) {
      expect(unique(resources[locale].translation as Tree)).toEqual(reference);
    }

    expect(reference.length).toBeGreaterThan(0);
  });
});

describe('resolved language', () => {
  it('falls back to Russian for an unsupported locale', () => {
    setLanguage('de');

    expect(i18n.t('home.title')).toBe('Мои привычки');
  });

  it('serves English for a region variant', () => {
    setLanguage('en-US');

    expect(i18n.t('common.add')).toBe('Add');
    expect(i18n.t('home.title')).toBe('My habits');
  });

  it('translates the shared keys into English', () => {
    setLanguage('en');

    expect(i18n.t('home.title')).toBe('My habits');
    expect(i18n.t('habitDetails.title')).toBe('Habit history');
    expect(i18n.t('nav.addHabit')).toBe('New habit');
    expect(i18n.t('habitForm.errors.duplicate')).toBe(
      'A habit with this name already exists',
    );
  });

  it('translates the shared keys into Russian', () => {
    setLanguage('ru');

    expect(i18n.t('home.title')).toBe('Мои привычки');
    expect(i18n.t('nav.addHabit')).toBe('Новая привычка');
  });
});

describe('Russian plurals', () => {
  const render = (count: number) =>
    i18n.t('habitDetails.statDays', { count } as never);

  beforeEach(() => setLanguage('ru'));

  it('uses the singular form for 1', () => {
    expect(render(1)).toBe('1 день');
  });

  it('uses the paucal form for 2-4', () => {
    expect(render(2)).toBe('2 дня');
    expect(render(4)).toBe('4 дня');
  });

  it('uses the genitive plural for 5-20', () => {
    expect(render(5)).toBe('5 дней');
    expect(render(11)).toBe('11 дней');
    expect(render(20)).toBe('20 дней');
  });

  it('resets the category at 21 and 22', () => {
    expect(render(21)).toBe('21 день');
    expect(render(22)).toBe('22 дня');
    expect(render(25)).toBe('25 дней');
  });
});

describe('English plurals', () => {
  const render = (count: number) =>
    i18n.t('habitDetails.statDays', { count } as never);

  beforeEach(() => setLanguage('en'));

  it('uses the singular form for exactly 1', () => {
    expect(render(1)).toBe('1 day');
  });

  it('uses the plural form for 0 and 2+', () => {
    expect(render(0)).toBe('0 days');
    expect(render(2)).toBe('2 days');
    expect(render(21)).toBe('21 days');
  });
});

describe('Indonesian plurals', () => {
  const render = (count: number) =>
    i18n.t('habitDetails.statDays', { count } as never);

  beforeEach(() => setLanguage('id'));

  it('uses a single form because Indonesian does not inflect for number', () => {
    expect(render(0)).toBe('0 hari');
    expect(render(1)).toBe('1 hari');
    expect(render(2)).toBe('2 hari');
    expect(render(21)).toBe('21 hari');
    expect(render(100)).toBe('100 hari');
  });
});

describe('Spanish plurals', () => {
  const render = (count: number) =>
    i18n.t('habitDetails.statDays', { count } as never);

  beforeEach(() => setLanguage('es'));

  it('uses the singular form for 1', () => {
    expect(render(1)).toBe('1 día');
  });

  it('uses the plural form for 0 and 2+', () => {
    expect(render(0)).toBe('0 días');
    expect(render(2)).toBe('2 días');
    expect(render(21)).toBe('21 días');
  });

  it('uses the many form for large round numbers', () => {
    expect(render(1000000)).toBe('1000000 de días');
  });
});

describe('Portuguese plurals', () => {
  const render = (count: number) =>
    i18n.t('habitDetails.statDays', { count } as never);

  beforeEach(() => setLanguage('pt'));

  it('uses the singular form for 1', () => {
    expect(render(1)).toBe('1 dia');
  });

  it('uses the plural form for 2+', () => {
    expect(render(2)).toBe('2 dias');
    expect(render(21)).toBe('21 dias');
  });

  it('treats 0 as singular, matching CLDR Portuguese', () => {
    expect(render(0)).toBe('0 dia');
  });

  it('uses the many form for large round numbers', () => {
    expect(render(1000000)).toBe('1000000 de dias');
  });
});

describe('Hindi plurals', () => {
  const render = (count: number) =>
    i18n.t('habitDetails.statDays', { count } as never);

  beforeEach(() => setLanguage('hi'));

  it('uses one form because the noun does not inflect for number', () => {
    expect(render(1)).toBe('1 दिन');
    expect(render(5)).toBe('5 दिन');
    expect(render(21)).toBe('21 दिन');
  });
});

describe('interpolated values', () => {
  it('keeps the percent sign attached in Russian', () => {
    setLanguage('ru');

    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');
  });

  it('keeps the percent sign attached in English', () => {
    setLanguage('en');

    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');
  });

  it('interpolates filter counts instead of concatenating them', () => {
    setLanguage('en');

    expect(i18n.t('filter.allWithCount', { total: 3 })).toBe('All · 3');
  });

  it('lets each locale place the percent sign as its typography requires', () => {
    setLanguage('ru');
    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');

    setLanguage('en');
    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');

    setLanguage('id');
    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');

    setLanguage('es');
    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe(
      '85\u00a0%',
    );

    setLanguage('pt');
    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');

    setLanguage('hi');
    expect(i18n.t('habitDetails.percentValue', { value: 85 })).toBe('85%');
  });
});
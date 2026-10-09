/**
 * @format
 */

import {
  getFirstDayOfWeek,
  getMonthGrid,
  monthLabel,
  shiftMonth,
  weekdayLabels,
} from '../src/utils/calendar';

const LOCALE = 'ru';

function gridFor(
  month: Date,
  options: {
    completed?: string[];
    today?: string;
    locale?: string;
  } = {},
) {
  const {
    completed = [],
    today = '2026-01-15',
    locale = LOCALE,
  } = options;

  return getMonthGrid(month, locale, new Set(completed), today);
}

function cellsOf(grid: ReturnType<typeof getMonthGrid>) {
  return grid.flat();
}

describe('getFirstDayOfWeek', () => {
  it('starts the week on Monday for Russian', () => {
    expect(getFirstDayOfWeek('ru')).toBe(1);
  });

  it('starts the week on Sunday for en-US', () => {
    expect(getFirstDayOfWeek('en-US')).toBe(7);
  });

  it('starts the week on Sunday for Indonesian and Hindi', () => {
    expect(getFirstDayOfWeek('id')).toBe(7);
    expect(getFirstDayOfWeek('hi')).toBe(7);
  });

  it('starts the week on Monday for Spanish', () => {
    expect(getFirstDayOfWeek('es')).toBe(1);
  });
});

describe('weekdayLabels', () => {
  it('returns seven headings', () => {
    expect(weekdayLabels('ru')).toHaveLength(7);
  });

  it('starts with Monday for Russian', () => {
    expect(weekdayLabels('ru')[0]).toBe('пн');
  });

  it('starts with Sunday for Indonesian', () => {
    expect(weekdayLabels('id')[0]).toBe('Min');
  });

  it('renders localized headings rather than raw numbers', () => {
    expect(weekdayLabels('hi').every(label => /\p{Script=Devanagari}/u.test(label))).toBe(true);
  });
});

describe('shiftMonth', () => {
  it('steps forward and back by whole months', () => {
    expect(shiftMonth(new Date(2026, 0, 15), 1).getMonth()).toBe(1);
    expect(shiftMonth(new Date(2026, 0, 15), -1).getMonth()).toBe(11);
  });

  it('always lands on the first of the month', () => {
    expect(shiftMonth(new Date(2026, 0, 31), 1).getDate()).toBe(1);
  });

  it('crosses the year boundary', () => {
    expect(shiftMonth(new Date(2026, 11, 1), 1).getFullYear()).toBe(2027);
    expect(shiftMonth(new Date(2026, 0, 1), -1).getFullYear()).toBe(2025);
  });

  it('keeps the same year for a round trip', () => {
    const start = new Date(2026, 5, 9);

    expect(shiftMonth(shiftMonth(start, 1), -1).getMonth()).toBe(5);
  });
});

describe('getMonthGrid', () => {
  const JANUARY_2026 = new Date(2026, 0, 1);

  it('always produces complete weeks of seven cells', () => {
    for (let month = 0; month < 12; month++) {
      const grid = gridFor(new Date(2026, month, 1));

      expect(grid.length).toBeGreaterThanOrEqual(4);
      expect(grid.length).toBeLessThanOrEqual(6);

      for (const week of grid) {
        expect(week).toHaveLength(7);
      }
    }
  });

  it('renders every day of the month exactly once', () => {
    const cells = cellsOf(gridFor(JANUARY_2026)).filter(
      cell => cell.dateKey !== null,
    );

    expect(cells).toHaveLength(31);
    expect(cells.map(cell => cell.day)).toEqual(
      Array.from({ length: 31 }, (_, index) => index + 1),
    );
  });

  it('pads a month that starts on Monday with no leading blanks', () => {
    const june = new Date(2026, 5, 1);

    expect(new Date(2026, 5, 1).getDay()).toBe(1);

    const firstWeek = gridFor(june)[0];

    expect(firstWeek[0].dateKey).toBe('2026-06-01');
    expect(firstWeek[0].day).toBe(1);
  });

  it('pads a month that starts mid-week', () => {
    const grid = gridFor(new Date(2026, 4, 1));
    const firstWeek = grid[0];
    const leadingBlanks = firstWeek.filter(cell => cell.dateKey === null).length;

    expect(leadingBlanks).toBe(4);
    expect(firstWeek[leadingBlanks].day).toBe(1);
  });

  it('handles February in a leap year', () => {
    const cells = cellsOf(gridFor(new Date(2024, 1, 1))).filter(
      cell => cell.dateKey !== null,
    );

    expect(cells).toHaveLength(29);
  });

  it('handles February in a common year', () => {
    const cells = cellsOf(gridFor(new Date(2026, 1, 1))).filter(
      cell => cell.dateKey !== null,
    );

    expect(cells).toHaveLength(28);
  });

  it('marks completed days', () => {
    const cells = cellsOf(
      gridFor(JANUARY_2026, { completed: ['2026-01-05', '2026-01-06'] }),
    );

    expect(cells.filter(cell => cell.isCompleted)).toHaveLength(2);
    expect(cells.find(cell => cell.day === 5)?.isCompleted).toBe(true);
    expect(cells.find(cell => cell.day === 7)?.isCompleted).toBe(false);
  });

  it('marks exactly one day as today', () => {
    const cells = cellsOf(gridFor(JANUARY_2026));

    expect(cells.filter(cell => cell.isToday)).toHaveLength(1);
    expect(cells.find(cell => cell.isToday)?.dateKey).toBe('2026-01-15');
  });

  it('has no today marker when today is outside the month', () => {
    const cells = cellsOf(gridFor(JANUARY_2026, { today: '2026-06-01' }));

    expect(cells.filter(cell => cell.isToday)).toHaveLength(0);
  });

  it('marks dates after today as future and leaves past ones interactive', () => {
    const cells = cellsOf(gridFor(JANUARY_2026, { today: '2026-01-15' })).filter(
      cell => cell.dateKey !== null,
    );

    const future = cells.filter(cell => cell.isFuture);
    const past = cells.filter(cell => !cell.isFuture);

    expect(future.map(cell => cell.day)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 16),
    );
    expect(past).toHaveLength(15);
    expect(past.every(cell => !cell.isFuture)).toBe(true);
  });

  it('treats today as interactive rather than future', () => {
    const cells = cellsOf(gridFor(JANUARY_2026));

    expect(cells.find(cell => cell.isToday)?.isFuture).toBe(false);
  });

  it('never marks padding cells as interactive', () => {
    const cells = cellsOf(gridFor(JANUARY_2026)).filter(
      cell => cell.dateKey === null,
    );

    expect(cells.length).toBeGreaterThan(0);

    for (const cell of cells) {
      expect(cell).toMatchObject({
        day: 0,
        isToday: false,
        isFuture: false,
        isCompleted: false,
      });
    }
  });

  it('aligns the first column with the locale week start', () => {
    const june = new Date(2026, 5, 1);

    const mondayGrid = gridFor(june, { locale: 'ru' })[0];
    const sundayGrid = gridFor(june, { locale: 'en-US' })[0];

    expect(mondayGrid[0].dateKey).toBe('2026-06-01');
    expect(sundayGrid[0].dateKey).toBeNull();
    expect(sundayGrid[1].dateKey).toBe('2026-06-01');
  });

  it('produces a stable grid across all locales and months', () => {
    for (const locale of ['ru', 'en-US', 'id', 'es', 'hi']) {
      for (let month = 0; month < 12; month++) {
        const grid = gridFor(new Date(2026, month, 1), { locale });

        for (const week of grid) {
          expect(week).toHaveLength(7);
        }
      }
    }
  });
});

describe('creation-date boundary', () => {
  const JANUARY_2026 = new Date(2026, 0, 1);

  function realCells(createdDateKey?: string) {
    return cellsOf(
      getMonthGrid(
        JANUARY_2026,
        'ru',
        new Set(['2026-01-05']),
        '2026-01-15',
        createdDateKey,
      ),
    ).filter(cell => cell.dateKey !== null);
  }

  it('marks days before creation as untappable', () => {
    const cells = realCells('2026-01-10');
    const before = cells.filter(cell => cell.day < 10);

    expect(before).toHaveLength(9);
    expect(before.every(cell => cell.isBeforeCreation)).toBe(true);
  });

  it('leaves the creation day and later interactive', () => {
    const fromCreation = realCells('2026-01-10').filter(
      cell => cell.day >= 10,
    );

    expect(fromCreation.every(cell => !cell.isBeforeCreation)).toBe(true);
  });

  it('marks nothing as before creation when no creation date is given', () => {
    expect(realCells().every(cell => !cell.isBeforeCreation)).toBe(true);
  });

  it('never lets a pre-creation day look like a future day', () => {
    expect(realCells('2026-01-10').find(cell => cell.day === 5)).toMatchObject({
      isBeforeCreation: true,
      isFuture: false,
    });
  });
});

describe('monthLabel', () => {
  it('renders the month and year', () => {
    expect(monthLabel(new Date(2026, 0, 1), 'ru')).toBe('январь 2026 г.');
  });

  it('uses the requested locale', () => {
    expect(monthLabel(new Date(2026, 0, 1), 'en')).toBe('January 2026');
    expect(monthLabel(new Date(2026, 0, 1), 'id')).toBe('Januari 2026');
  });
});
/**
 * @format
 */

import {
  daysBetween,
  getCompletionRate,
  getCurrentStreak,
  getHabitStats,
} from '../src/utils/stats';

const TODAY = '2026-01-01';

function shiftDays(dateKey: string, offset: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day + offset);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

describe('daysBetween', () => {
  it('counts whole days between keys', () => {
    expect(daysBetween('2026-01-01', '2026-01-11')).toBe(10);
  });

  it('never returns a negative distance', () => {
    expect(daysBetween('2026-01-11', '2026-01-01')).toBe(0);
  });

  it('handles leap years', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
  });

  it('returns 0 for malformed keys', () => {
    expect(daysBetween('broken', TODAY)).toBe(0);
  });
});

describe('getCurrentStreak', () => {
  it('is 0 without completions', () => {
    expect(getCurrentStreak([], TODAY)).toBe(0);
  });

  it('counts today as 1', () => {
    expect(getCurrentStreak([TODAY], TODAY)).toBe(1);
  });

  it('counts consecutive days backwards', () => {
    expect(
      getCurrentStreak([shiftDays(TODAY, 0), shiftDays(TODAY, -1)], TODAY),
    ).toBe(2);
  });

  it('keeps the chain alive when today is still pending', () => {
    expect(
      getCurrentStreak([shiftDays(TODAY, -1), shiftDays(TODAY, -2)], TODAY),
    ).toBe(2);
  });

  it('breaks on a gap', () => {
    expect(
      getCurrentStreak([shiftDays(TODAY, 0), shiftDays(TODAY, -2)], TODAY),
    ).toBe(1);
  });

  it('is 0 when the chain already ended', () => {
    expect(getCurrentStreak([shiftDays(TODAY, -5)], TODAY)).toBe(0);
  });

  it('crosses month boundaries', () => {
    expect(
      getCurrentStreak(
        ['2025-12-31', '2025-12-30', '2025-12-29'],
        '2026-01-01',
      ),
    ).toBe(3);
  });

  it('crosses leap day', () => {
    expect(
      getCurrentStreak(
        ['2024-02-28', '2024-02-29', '2024-03-01'],
        '2024-03-01',
      ),
    ).toBe(3);
  });

  it('ignores duplicate dates', () => {
    expect(getCurrentStreak([TODAY, TODAY, shiftDays(TODAY, -1)], TODAY)).toBe(
      2,
    );
  });

  it('is 0 for a malformed today key', () => {
    expect(getCurrentStreak([TODAY], 'broken')).toBe(0);
  });
});

describe('getCompletionRate', () => {
  it('is 0 with no completions', () => {
    expect(getCompletionRate([], '2025-12-22', TODAY)).toBe(0);
  });

  it('rounds to whole percent', () => {
    const completed = Array.from({ length: 5 }, (_, index) =>
      shiftDays(TODAY, index - 10),
    );

    expect(getCompletionRate(completed, '2025-12-22', TODAY)).toBe(45);
  });

  it('is 100 for a habit completed on its creation day', () => {
    expect(getCompletionRate([TODAY], TODAY, TODAY)).toBe(100);
  });

  it('does not exceed 100 with duplicate dates', () => {
    expect(getCompletionRate([TODAY, TODAY, TODAY], TODAY, TODAY)).toBe(100);
  });

  it('is 0 when the habit was created in the future', () => {
    expect(getCompletionRate([], shiftDays(TODAY, 5), TODAY)).toBe(0);
  });
});

describe('getHabitStats', () => {
  it('bundles the three metrics', () => {
    expect(
      getHabitStats(
        [TODAY, shiftDays(TODAY, -1), shiftDays(TODAY, -2)],
        '2025-12-22',
        TODAY,
      ),
    ).toEqual({ totalCompleted: 3, streak: 3, completionRate: 27 });
  });

  it('reports zeroes for a fresh habit', () => {
    expect(getHabitStats([], TODAY, TODAY)).toEqual({
      totalCompleted: 0,
      streak: 0,
      completionRate: 0,
    });
  });
});

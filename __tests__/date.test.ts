/**
 * @format
 */

import {
  formatDateForDisplay,
  formatDateKey,
  msUntilNextDay,
} from '../src/utils/date';

describe('formatDateKey', () => {
  it('zero-pads month and day', () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('msUntilNextDay', () => {
  it('counts the rest of the day', () => {
    expect(msUntilNextDay(new Date(2026, 0, 5, 21, 0, 0))).toBe(3 * 60 * 60 * 1000);
  });

  it('returns 24 hours at exact midnight', () => {
    expect(msUntilNextDay(new Date(2026, 0, 5))).toBe(24 * 60 * 60 * 1000);
  });

  it('is never zero right before midnight', () => {
    const justBeforeMidnight = new Date(2026, 0, 5, 23, 59, 59, 999);

    expect(msUntilNextDay(justBeforeMidnight)).toBeGreaterThan(0);
  });

  it('never returns less than the floor value', () => {
    const almostMidnight = new Date(
      new Date(2026, 0, 5, 23, 59, 59, 999).getTime() - 0.999
    );

    expect(msUntilNextDay(almostMidnight)).toBe(1000);
  });

  it('crosses a leap day', () => {
    expect(msUntilNextDay(new Date(2024, 1, 28, 12, 0, 0))).toBe(
      12 * 60 * 60 * 1000
    );
  });
});

describe('formatDateForDisplay', () => {
  it('formats a valid key', () => {
    expect(formatDateForDisplay('2026-01-05')).toContain('2026');
  });

  it('returns the input for a malformed key', () => {
    expect(formatDateForDisplay('broken')).toBe('broken');
  });
});
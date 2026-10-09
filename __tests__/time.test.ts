/**
 * @format
 */

import {
  formatReminderTime,
  formatReminderTimeForDisplay,
  getNextReminderDate,
  isValidReminderTime,
  parseReminderTime,
} from '../src/utils/time';

describe('isValidReminderTime', () => {
  it('accepts zero-padded 24-hour times', () => {
    expect(isValidReminderTime('00:00')).toBe(true);
    expect(isValidReminderTime('09:05')).toBe(true);
    expect(isValidReminderTime('23:59')).toBe(true);
  });

  it('rejects out-of-range hours and minutes', () => {
    expect(isValidReminderTime('24:00')).toBe(false);
    expect(isValidReminderTime('07:60')).toBe(false);
  });

  it('rejects unpadded and malformed values', () => {
    expect(isValidReminderTime('7:05')).toBe(false);
    expect(isValidReminderTime('09-05')).toBe(false);
    expect(isValidReminderTime('09:05:00')).toBe(false);
    expect(isValidReminderTime('')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isValidReminderTime(null)).toBe(false);
    expect(isValidReminderTime(905)).toBe(false);
    expect(isValidReminderTime(undefined)).toBe(false);
  });
});

describe('parse and format', () => {
  it('splits a valid time into parts', () => {
    expect(parseReminderTime('07:05')).toEqual({ hours: 7, minutes: 5 });
  });

  it('zero-pads on the way back', () => {
    expect(formatReminderTime(7, 5)).toBe('07:05');
    expect(formatReminderTime(0, 0)).toBe('00:00');
    expect(formatReminderTime(23, 59)).toBe('23:59');
  });

  it('round-trips every quarter hour of the day', () => {
    for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      const text = formatReminderTime(hours, rest);

      expect(isValidReminderTime(text)).toBe(true);
      expect(parseReminderTime(text)).toEqual({ hours, minutes: rest });
    }
  });
});

describe('getNextReminderDate', () => {
  const NOW = new Date(2026, 0, 15, 10, 0, 0);

  it('keeps today when the time is still ahead', () => {
    const next = getNextReminderDate('18:00', NOW);

    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(15);
    expect(next.getHours()).toBe(18);
    expect(next.getMinutes()).toBe(0);
  });

  it('rolls to tomorrow when the time already passed', () => {
    const next = getNextReminderDate('08:00', NOW);

    expect(next.getDate()).toBe(16);
    expect(next.getHours()).toBe(8);
  });

  it('rolls to tomorrow when the time is exactly now, never the same instant', () => {
    const next = getNextReminderDate('10:00', NOW);

    expect(next.getDate()).toBe(16);
    expect(next.getTime()).toBeGreaterThan(NOW.getTime());
  });

  it('always returns a strictly future instant', () => {
    for (let hours = 0; hours < 24; hours++) {
      const time = formatReminderTime(hours, 30);
      const next = getNextReminderDate(time, NOW);

      expect(next.getTime()).toBeGreaterThan(NOW.getTime());
      expect(next.getHours()).toBe(hours);
      expect(next.getMinutes()).toBe(30);
    }
  });

  it('crosses the month boundary', () => {
    const next = getNextReminderDate('08:00', new Date(2026, 0, 31, 12, 0, 0));

    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(1);
  });

  it('crosses the year boundary', () => {
    const next = getNextReminderDate('08:00', new Date(2026, 11, 31, 12, 0, 0));

    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(0);
    expect(next.getDate()).toBe(1);
  });

  it('handles a leap day', () => {
    const next = getNextReminderDate('08:00', new Date(2024, 1, 28, 12, 0, 0));

    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(29);
  });

  it('clears seconds and milliseconds', () => {
    const next = getNextReminderDate('09:07', new Date(2026, 0, 15, 8, 0, 45, 123));

    expect(next.getSeconds()).toBe(0);
    expect(next.getMilliseconds()).toBe(0);
  });

  it('survives a DST jump forward', () => {
    const next = getNextReminderDate('02:30', new Date(2026, 2, 8, 1, 30, 0));

    expect(next.getTime()).toBeGreaterThan(new Date(2026, 2, 8, 1, 30).getTime());
  });
});

describe('formatReminderTimeForDisplay', () => {
  it('passes 24-hour times through unchanged', () => {
    expect(formatReminderTimeForDisplay('09:05', true)).toBe('09:05');
    expect(formatReminderTimeForDisplay('23:59', true)).toBe('23:59');
  });

  it('renders 12-hour times with a meridiem', () => {
    expect(formatReminderTimeForDisplay('09:05', false)).toBe('9:05 AM');
    expect(formatReminderTimeForDisplay('13:30', false)).toBe('1:30 PM');
  });

  it('renders midnight and noon correctly on a 12-hour clock', () => {
    expect(formatReminderTimeForDisplay('00:00', false)).toBe('12:00 AM');
    expect(formatReminderTimeForDisplay('12:00', false)).toBe('12:00 PM');
  });
});
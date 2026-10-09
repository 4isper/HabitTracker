import i18n from '../i18n';

const MIN_MS_UNTIL_NEXT_DAY = 1000;

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(dateKey: unknown): dateKey is string {
  return typeof dateKey === 'string' && DATE_KEY_PATTERN.test(dateKey);
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function msUntilNextDay(now: Date = new Date()): number {
  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  return Math.max(nextDay.getTime() - now.getTime(), MIN_MS_UNTIL_NEXT_DAY);
}

export function formatDateForDisplay(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);

  if (parts.length !== 3) {
    return dateKey;
  }

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (!year || !month || !day) {
    return dateKey;
  }

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
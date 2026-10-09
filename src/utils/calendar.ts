import { formatDateKey } from './date';

export type CalendarCell = {
  dateKey: string | null;
  day: number;
  isToday: boolean;
  isFuture: boolean;
  isCompleted: boolean;
  /** Before the habit existed: neither tappable nor countable. */
  isBeforeCreation: boolean;
};

export type CalendarWeek = CalendarCell[];

const DAYS_IN_WEEK = 7;

type LocaleWithWeekInfo = Intl.Locale & {
  weekInfo?: { firstDay: number };
  getWeekInfo?: () => { firstDay: number };
};

/**
 * 1 = Monday … 7 = Sunday.
 *
 * `weekInfo` is the only correct source for this; there is no locale-independent
 * way to infer the week start from `Intl.DateTimeFormat` alone. Runtimes without
 * it (some Hermes builds) fall back to Monday, which is right for the `ru`, `es`
 * and `pt` bundles and wrong by one column for `en`, `id` and `hi`.
 */
export function getFirstDayOfWeek(locale: string): number {
  try {
    const localeObject = new Intl.Locale(locale) as LocaleWithWeekInfo;
    const info = localeObject.weekInfo ?? localeObject.getWeekInfo?.();

    return info?.firstDay ?? 1;
  } catch {
    return 1;
  }
}

export function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

/**
 * Full weeks covering `month`, padded with empty cells so every week has seven
 * slots and columns line up with `getFirstDayOfWeek(locale)`.
 */
export function getMonthGrid(
  month: Date,
  locale: string,
  completedDates: ReadonlySet<string>,
  todayKey: string,
  createdDateKey?: string,
): CalendarWeek[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDayOfWeek = getFirstDayOfWeek(locale);

  const leadingBlanks =
    (new Date(year, monthIndex, 1).getDay() - firstDayOfWeek + DAYS_IN_WEEK) %
    DAYS_IN_WEEK;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount =
    Math.ceil((leadingBlanks + daysInMonth) / DAYS_IN_WEEK) * DAYS_IN_WEEK;

  const weeks: CalendarCell[] = [];
  const grid: CalendarWeek[] = [];

  for (let index = 0; index < cellCount; index++) {
    const dayOfMonth = index - leadingBlanks + 1;

    if (dayOfMonth < 1 || dayOfMonth > daysInMonth) {
      weeks.push({
        dateKey: null,
        day: 0,
        isToday: false,
        isFuture: false,
        isCompleted: false,
        isBeforeCreation: false,
      });
    } else {
      const date = new Date(year, monthIndex, dayOfMonth);
      const dateKey = formatDateKey(date);

      weeks.push({
        dateKey,
        day: dayOfMonth,
        isToday: dateKey === todayKey,
        isFuture: dateKey > todayKey,
        isCompleted: completedDates.has(dateKey),
        isBeforeCreation:
          createdDateKey !== undefined && dateKey < createdDateKey,
      });
    }

    if (weeks.length === DAYS_IN_WEEK) {
      grid.push(weeks.splice(0, weeks.length));
    }
  }

  return grid;
}

export function monthLabel(month: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(month);
}

/** Weekday column headings, ordered to match the grid. */
export function weekdayLabels(locale: string): string[] {
  const firstDayOfWeek = getFirstDayOfWeek(locale);

  // 2024-01-01 was a Monday.
  const reference = Date.UTC(2024, 0, 1);
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  });

  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const mondayOffset = (firstDayOfWeek - 1 + index) % DAYS_IN_WEEK;

    return formatter.format(reference + mondayOffset * 86_400_000);
  });
}
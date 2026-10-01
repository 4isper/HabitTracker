import { formatDateKey, getTodayKey } from './date';

export type HabitStats = {
  totalCompleted: number;
  streak: number;
  completionRate: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateKey(date: Date): string {
  return formatDateKey(date);
}

function parseDateKey(dateKey: string): Date | null {
  const [year, month, day] = dateKey.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(from: string, to: string): number {
  const fromDate = parseDateKey(from);
  const toDate = parseDateKey(to);

  if (!fromDate || !toDate) {
    return 0;
  }

  const diff = toDate.getTime() - fromDate.getTime();

  if (Number.isNaN(diff)) {
    return 0;
  }

  return Math.max(0, Math.round(diff / MS_PER_DAY));
}

export function getCurrentStreak(
  completedDates: string[],
  todayKey: string = getTodayKey(),
): number {
  if (completedDates.length === 0) {
    return 0;
  }

  const completed = new Set(completedDates);
  const today = parseDateKey(todayKey);

  if (!today) {
    return 0;
  }

  const cursor = startOfDay(today);

  // A streak stays alive until the current day ends, so an unfinished today
  // keeps counting the chain that ended yesterday.
  if (!completed.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);

    if (!completed.has(toDateKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;

  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getCompletionRate(
  completedDates: string[],
  createdAt: string,
  todayKey: string = getTodayKey(),
): number {
  const createdDateKey = toDateKey(new Date(createdAt));
  const trackedDays = daysBetween(createdDateKey, todayKey) + 1;

  if (trackedDays <= 0) {
    return 0;
  }

  const uniqueCompleted = new Set(completedDates).size;

  return Math.round((uniqueCompleted / trackedDays) * 100);
}

export function getHabitStats(
  completedDates: string[],
  createdAt: string,
  todayKey: string = getTodayKey(),
): HabitStats {
  return {
    totalCompleted: new Set(completedDates).size,
    streak: getCurrentStreak(completedDates, todayKey),
    completionRate: getCompletionRate(completedDates, createdAt, todayKey),
  };
}

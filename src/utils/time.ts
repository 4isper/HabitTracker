const REMINDER_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type ReminderTime = string;

export function isValidReminderTime(value: unknown): value is ReminderTime {
  return typeof value === 'string' && REMINDER_PATTERN.test(value);
}

export function parseReminderTime(value: ReminderTime): {
  hours: number;
  minutes: number;
} {
  const [hours, minutes] = value.split(':').map(Number);

  return { hours, minutes };
}

export function formatReminderTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Next moment the daily reminder should fire, strictly in the future.
 *
 * A reminder whose time already passed today moves to tomorrow, so rescheduling
 * on every app launch never pushes the notification further into the past.
 */
export function getNextReminderDate(
  reminderTime: ReminderTime,
  now: Date = new Date(),
): Date {
  const { hours, minutes } = parseReminderTime(reminderTime);
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Renders `HH:mm` for display, honouring the device's clock convention.
 */
export function formatReminderTimeForDisplay(
  reminderTime: ReminderTime,
  use24HourClock: boolean,
): string {
  const { hours, minutes } = parseReminderTime(reminderTime);

  if (use24HourClock) {
    return reminderTime;
  }

  const suffix = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}
import { createMMKV } from 'react-native-mmkv';

import i18n from '../i18n';
import { isValidDateKey } from '../utils/date';
import { isValidReminderTime } from '../utils/time';

import type { Habit } from '../types/habit';

const HABITS_STORAGE_KEY = 'habits';
const SCHEMA_VERSION_KEY = 'habits.schemaVersion';
const RAW_BACKUP_KEY = 'habits.rawBackup';

const CURRENT_SCHEMA_VERSION = 2;

const storage = createMMKV();

export type LoadStatus = 'ok' | 'repaired' | 'failed';

export type LoadHabitsResult = {
  habits: Habit[];
  /**
   * `failed` means the payload could not be read at all and must not be
   * overwritten by the caller: the raw string is the only copy of the user's
   * data and it may still be recoverable.
   */
  status: LoadStatus;
};

type SanitizedHabit = {
  habit: Habit | null;
  changed: boolean;
};

function readStoredString(key: string): string | undefined {
  const value = storage.getString(key);

  return value === '' ? undefined : value;
}

function sanitizeCompletedDates(value: unknown): {
  dates: string[];
  changed: boolean;
} {
  if (!Array.isArray(value)) {
    return { dates: [], changed: true };
  }

  const dates = new Set<string>();

  for (const entry of value) {
    if (isValidDateKey(entry)) {
      dates.add(entry);
    }
  }

  return { dates: [...dates], changed: dates.size !== value.length };
}

function sanitizeOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function sanitizeHabit(value: unknown): SanitizedHabit {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { habit: null, changed: true };
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== 'string' ||
    candidate.id.length === 0 ||
    typeof candidate.name !== 'string' ||
    candidate.name.length === 0 ||
    typeof candidate.createdAt !== 'string' ||
    candidate.createdAt.length === 0
  ) {
    return { habit: null, changed: true };
  }

  const { dates: completedDates, changed: datesChanged } = sanitizeCompletedDates(
    candidate.completedDates,
  );

  const reminderChanged =
    candidate.reminderTime !== undefined &&
    !isValidReminderTime(candidate.reminderTime);

  return {
    habit: {
      id: candidate.id,
      name: candidate.name,
      createdAt: candidate.createdAt,
      completedDates,
      emoji: sanitizeOptionalString(candidate.emoji),
      color: sanitizeOptionalString(candidate.color),
      reminderTime: isValidReminderTime(candidate.reminderTime)
        ? candidate.reminderTime
        : undefined,
    },
    changed: datesChanged || reminderChanged,
  };
}

/**
 * Single place where unknown persisted data becomes `Habit[]`.
 *
 * Everything read from storage is untrusted: it may have been written by an
 * older app version, restored from a backup, or truncated. Callers rely on the
 * invariant this establishes — every returned habit has a non-empty string
 * `id`, `name`, `createdAt` and an array `completedDates` with unique
 * well-formed keys — so no consumer has to null-check.
 */
function normalizeHabits(parsed: unknown): {
  habits: Habit[];
  changed: boolean;
} {
  if (!Array.isArray(parsed)) {
    return { habits: [], changed: true };
  }

  const seenIds = new Set<string>();
  const habits: Habit[] = [];
  let changed = false;

  for (const entry of parsed) {
    const { habit, changed: entryChanged } = sanitizeHabit(entry);

    changed ||= entryChanged;

    if (!habit) {
      continue;
    }

    if (seenIds.has(habit.id)) {
      changed = true;
      continue;
    }

    seenIds.add(habit.id);
    habits.push(habit);
  }

  return { habits, changed };
}

function backupRawPayload(raw: string): void {
  if (readStoredString(RAW_BACKUP_KEY) === raw) {
    return;
  }

  try {
    storage.set(RAW_BACKUP_KEY, raw);
  } catch (error) {
    console.warn(i18n.t('storage.backupFailed'), error);
  }
}

export function loadHabits(): LoadHabitsResult {
  const raw = readStoredString(HABITS_STORAGE_KEY);

  if (raw === undefined) {
    return { habits: [], status: 'ok' };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn(i18n.t('storage.loadFailed'), error);
    backupRawPayload(raw);

    return { habits: [], status: 'failed' };
  }

  if (!Array.isArray(parsed)) {
    backupRawPayload(raw);

    return { habits: [], status: 'failed' };
  }

  const { habits, changed } = normalizeHabits(parsed);

  if (changed) {
    backupRawPayload(raw);
  }

  return { habits, status: changed ? 'repaired' : 'ok' };
}

export function saveHabits(habits: Habit[]): boolean {
  try {
    storage.set(HABITS_STORAGE_KEY, JSON.stringify(habits));
    storage.set(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);

    return true;
  } catch (error) {
    console.warn(i18n.t('storage.saveFailed'), error);

    return false;
  }
}

/**
 * Last-resort recovery used by the error boundary. Drops the unreadable
 * payload together with its backup so the app can start from a clean state.
 */
export function resetHabits(): void {
  storage.remove(HABITS_STORAGE_KEY);
  storage.remove(SCHEMA_VERSION_KEY);
  storage.remove(RAW_BACKUP_KEY);
}
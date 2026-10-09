/**
 * @format
 */

import * as ReactNativeMMKV from 'react-native-mmkv';

import { loadHabits, resetHabits, saveHabits } from '../src/storage/habitsStorage';

import type { Habit } from '../src/types/habit';

jest.mock('react-native-mmkv', () => {
  const data = new Map<string, unknown>();

  return {
    __data: data,
    createMMKV: () => ({
      getString: (key: string) => {
        const value = data.get(key);

        return typeof value === 'string' ? value : undefined;
      },
      getNumber: (key: string) => {
        const value = data.get(key);

        return typeof value === 'number' ? value : undefined;
      },
      set: (key: string, value: unknown) => {
        data.set(key, value);
      },
      remove: (key: string) => data.delete(key),
    }),
  };
});

const store = (
  ReactNativeMMKV as unknown as { __data: Map<string, unknown> }
).__data;

const HABITS_KEY = 'habits';
const BACKUP_KEY = 'habits.rawBackup';

function seed(payload: unknown): void {
  store.set(HABITS_KEY, JSON.stringify(payload));
}

function validHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'a1',
    name: 'Пить воду',
    createdAt: '2026-01-01T00:00:00.000Z',
    completedDates: ['2026-01-01'],
    ...overrides,
  };
}

beforeEach(() => {
  store.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('loadHabits on valid payloads', () => {
  it('reports ok and returns habits when storage is empty', () => {
    expect(loadHabits()).toEqual({ habits: [], status: 'ok' });
  });

  it('reports ok for a well-formed payload', () => {
    seed([validHabit(), validHabit({ id: 'a2', name: 'Бег' })]);

    const result = loadHabits();

    expect(result.status).toBe('ok');
    expect(result.habits).toHaveLength(2);
  });

  it('round-trips what saveHabits wrote', () => {
    const habits = [validHabit(), validHabit({ id: 'a2', name: 'Бег' })];

    saveHabits(habits);

    expect(loadHabits()).toEqual({ habits, status: 'ok' });
  });
});

describe('loadHabits schema repair', () => {
  it('replaces a non-array completedDates instead of propagating undefined', () => {
    seed([{ ...validHabit(), completedDates: undefined }]);

    const result = loadHabits();

    expect(result.status).toBe('repaired');
    expect(result.habits[0].completedDates).toEqual([]);
    expect(() => result.habits[0].completedDates.includes('2026-01-01')).not.toThrow();
  });

  it('coerces a non-array completedDates value to an empty array', () => {
    seed([{ ...validHabit(), completedDates: 'nope' }]);

    const result = loadHabits();

    expect(result.status).toBe('repaired');
    expect(result.habits[0].completedDates).toEqual([]);
  });

  it('drops malformed date keys but keeps well-formed ones', () => {
    seed([{ ...validHabit(), completedDates: ['2026-01-01', 'broken', 42, null] }]);

    const result = loadHabits();

    expect(result.habits[0].completedDates).toEqual(['2026-01-01']);
  });

  it('deduplicates completedDates so FlatList keys stay unique', () => {
    seed([{ ...validHabit(), completedDates: ['2026-01-01', '2026-01-01'] }]);

    const result = loadHabits();

    expect(result.habits[0].completedDates).toEqual(['2026-01-01']);
  });

  it('drops entries missing required string fields', () => {
    seed([
      validHabit({ id: 'ok' }),
      { id: 'no-name', createdAt: '2026-01-01T00:00:00.000Z' },
      { name: 'no-id', createdAt: '2026-01-01T00:00:00.000Z' },
      validHabit({ id: '', name: 'Пустой id' }),
      null,
      'nonsense',
    ]);

    const result = loadHabits();

    expect(result.status).toBe('repaired');
    expect(result.habits.map(habit => habit.id)).toEqual(['ok']);
  });

  it('keeps only the first habit when ids collide', () => {
    seed([
      validHabit({ id: 'dup', name: 'Первая' }),
      validHabit({ id: 'dup', name: 'Вторая' }),
    ]);

    const result = loadHabits();

    expect(result.status).toBe('repaired');
    expect(result.habits).toHaveLength(1);
    expect(result.habits[0].name).toBe('Первая');
  });

  it('drops non-string optional fields', () => {
    seed([{ ...validHabit(), emoji: 7, color: null }]);

    const result = loadHabits();

    expect(result.habits[0].emoji).toBeUndefined();
    expect(result.habits[0].color).toBeUndefined();
  });
});

describe('loadHabits on unreadable payloads', () => {
  it('reports failed and leaves the raw payload untouched', () => {
    store.set(HABITS_KEY, '{ not json');

    const result = loadHabits();

    expect(result).toEqual({ habits: [], status: 'failed' });
    expect(store.get(HABITS_KEY)).toBe('{ not json');
    expect(store.get(BACKUP_KEY)).toBe('{ not json');
  });

  it('reports failed when the root value is not an array', () => {
    seed({ habits: [] });

    const result = loadHabits();

    expect(result).toEqual({ habits: [], status: 'failed' });
    expect(store.get(BACKUP_KEY)).toBe(JSON.stringify({ habits: [] }));
  });

  it('reports failed for a scalar root value', () => {
    seed('hello');

    expect(loadHabits().status).toBe('failed');
  });

  it('keeps the backup intact across repeated launches', () => {
    store.set(HABITS_KEY, '{ broken');

    loadHabits();
    const backupAfterFirstLaunch = store.get(BACKUP_KEY);

    loadHabits();

    expect(store.get(BACKUP_KEY)).toBe(backupAfterFirstLaunch);
    expect(store.get(BACKUP_KEY)).toBe('{ broken');
  });

  it('does not create a backup for a valid payload', () => {
    seed([validHabit()]);

    loadHabits();

    expect(store.get(BACKUP_KEY)).toBeUndefined();
  });
});

describe('resetHabits', () => {
  it('clears both the payload and its backup', () => {
    store.set(HABITS_KEY, '{ broken');

    loadHabits();
    resetHabits();

    expect(store.get(HABITS_KEY)).toBeUndefined();
    expect(store.get(BACKUP_KEY)).toBeUndefined();
  });
});
/**
 * @format
 */

import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';

import * as ReactNativeMMKV from 'react-native-mmkv';
import * as Notifee from '@notifee/react-native';

import { HabitsProvider, useHabits } from '../src/state/HabitsContext';
import { getTodayKey } from '../src/utils/date';
import { getCompletionRate } from '../src/utils/stats';

import type { ReactTestRenderer } from 'react-test-renderer';

type MockedNotifee = {
  __scheduled: Map<string, unknown>;
  __setAuthorizationStatus: (status: number) => void;
  __reset: () => void;
  AuthorizationStatus: Record<string, number>;
};

const notifeeMock = Notifee as unknown as MockedNotifee;

const { AuthorizationStatus: AUTHORIZATION_STATUS } = notifeeMock;

const scheduled = notifeeMock.__scheduled;

function setAuthorizationStatus(status: number): void {
  notifeeMock.__setAuthorizationStatus(status);
}

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

type HabitsApi = ReturnType<typeof useHabits>;

let api: HabitsApi | null = null;

function Consumer() {
  api = useHabits();

  return <Text>ok</Text>;
}

function renderProvider(): ReactTestRenderer {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(
      <HabitsProvider>
        <Consumer />
      </HabitsProvider>,
    );
  });

  return tree as ReactTestRenderer;
}

/**
 * Reminder reconciliation runs through several awaited native calls, so its
 * effects settle only after the microtask queue drains.
 */
async function renderProviderAsync(): Promise<ReactTestRenderer> {
  let tree: ReactTestRenderer | undefined;

  await act(async () => {
    tree = create(
      <HabitsProvider>
        <Consumer />
      </HabitsProvider>,
    );
  });

  return tree as ReactTestRenderer;
}

function readPayload(): unknown {
  const raw = store.get(HABITS_KEY);

  return typeof raw === 'string' ? JSON.parse(raw) : undefined;
}

beforeEach(() => {
  store.clear();
  scheduled.clear();
  setAuthorizationStatus(AUTHORIZATION_STATUS.AUTHORIZED);
  api = null;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('HabitsProvider persistence', () => {
  it('does not overwrite unreadable storage on mount', () => {
    store.set(HABITS_KEY, '{ not json');

    renderProvider();

    expect(store.get(HABITS_KEY)).toBe('{ not json');
    expect(store.get(BACKUP_KEY)).toBe('{ not json');
    expect(api?.habits).toEqual([]);
  });

  it('still persists explicit user changes after a failed load', () => {
    store.set(HABITS_KEY, '{ not json');

    renderProvider();

    act(() => {
      api?.addHabit({ name: 'Пить воду' });
    });

    const persisted = readPayload() as Array<{ name: string }>;

    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toBe('Пить воду');
  });

  it('self-heals a repairable payload on mount', () => {
    store.set(
      HABITS_KEY,
      JSON.stringify([
        { id: 'a1', name: 'Пить воду', createdAt: '2026-01-01T00:00:00.000Z' },
      ]),
    );

    renderProvider();

    const persisted = readPayload() as Array<{
      name: string;
      completedDates: string[];
    }>;

    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toBe('Пить воду');
    expect(persisted[0].completedDates).toEqual([]);
    expect(store.get(BACKUP_KEY)).toContain('Пить воду');
  });

  it('writes unchanged storage back without a backup', () => {
    const payload = JSON.stringify([
      {
        id: 'a1',
        name: 'Пить воду',
        createdAt: '2026-01-01T00:00:00.000Z',
        completedDates: ['2026-01-01'],
      },
    ]);

    store.set(HABITS_KEY, payload);

    renderProvider();

    expect(readPayload()).toEqual(JSON.parse(payload));
    expect(store.get(BACKUP_KEY)).toBeUndefined();
  });
});

describe('HabitsProvider reminders', () => {
  function scheduledIds(): string[] {
    return [...scheduled.keys()].sort();
  }

  it('schedules a reminder when a habit is created with one', async () => {
    await renderProviderAsync();

    await act(async () => {
      api?.addHabit({ name: 'Пить воду', reminderTime: '09:00' });
    });

    expect(scheduled.size).toBe(1);
  });

  it('schedules nothing for a habit without a reminder', async () => {
    await renderProviderAsync();

    await act(async () => {
      api?.addHabit({ name: 'Пить воду' });
    });

    expect(scheduled.size).toBe(0);
  });

  it('reschedules when the reminder time changes', async () => {
    await renderProviderAsync();

    await act(async () => {
      api?.addHabit({ name: 'Пить воду', reminderTime: '09:00' });
    });

    const [habit] = api!.habits;

    await act(async () => {
      api?.updateHabit(habit.id, { name: 'Пить воду', reminderTime: '18:00' });
    });

    expect(scheduled.size).toBe(1);
  });

  it('does not touch alarms when a checkbox is toggled', async () => {
    await renderProviderAsync();

    await act(async () => {
      api?.addHabit({ name: 'Пить воду', reminderTime: '09:00' });
    });

    const id = api!.habits[0].id;

    await act(async () => {
      api?.toggleToday(id);
    });

    expect(scheduled.size).toBe(1);
  });

  it('cancels the alarm when a habit is deleted', async () => {
    await renderProviderAsync();

    await act(async () => {
      api?.addHabit({ name: 'Пить воду', reminderTime: '09:00' });
    });

    const id = api!.habits[0].id;

    await act(async () => {
      api?.deleteHabit(id);
    });

    expect(scheduled.size).toBe(0);
  });

  it('rebuilds the whole schedule on launch, recovering from a reboot', async () => {
    store.set(
      HABITS_KEY,
      JSON.stringify([
        {
          id: 'a1',
          name: 'Пить воду',
          createdAt: '2026-01-01T00:00:00.000Z',
          completedDates: [],
          reminderTime: '09:00',
        },
      ]),
    );

    await renderProviderAsync();

    expect(scheduledIds()).toEqual(['habit-reminder-a1']);
  });
});

describe('HabitsProvider toggleDate', () => {
  const TODAY = getTodayKey();

  function withDates(...dates: string[]) {
    store.set(
      HABITS_KEY,
      JSON.stringify([
        {
          id: 'a1',
          name: 'Пить воду',
          createdAt: '2026-01-01T00:00:00.000Z',
          completedDates: dates,
        },
      ]),
    );
  }

  function completed() {
    return api!.habits[0].completedDates;
  }

  it('marks an arbitrary past day', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2026-01-05');
    });

    expect(completed()).toContain('2026-01-05');
  });

  it('unmarks a day that is already marked', () => {
    withDates('2026-01-05');

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2026-01-05');
    });

    expect(completed()).not.toContain('2026-01-05');
  });

  it('keeps completedDates sorted so calendar keys stay ordered', () => {
    withDates('2026-01-20', '2026-01-02');

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2026-01-10');
    });

    expect(completed()).toEqual(['2026-01-02', '2026-01-10', '2026-01-20']);
  });

  it('refuses to mark a future day', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2999-01-01');
    });

    expect(completed()).toEqual([]);
  });

  it('allows marking today', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', TODAY);
    });

    expect(completed()).toContain(TODAY);
  });

  it('refuses to mark a day before the habit was created', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2025-12-31');
      api?.toggleDate('a1', '2025-06-01');
    });

    expect(completed()).toEqual([]);
  });

  it('allows marking the creation day itself', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2026-01-01');
    });

    expect(completed()).toContain('2026-01-01');
  });

  it('keeps the completion rate at or below 100 after back-filling', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2026-01-05');
      api?.toggleDate('a1', '2026-01-06');
      api?.toggleDate('a1', '2026-01-07');
    });

    const habit = api!.habits[0];

    expect(
      getCompletionRate(habit.completedDates, habit.createdAt),
    ).toBeLessThanOrEqual(100);
  });

  it('ignores a malformed date key', () => {
    withDates();

    renderProvider();

    act(() => {
      api?.toggleDate('a1', 'broken');
      api?.toggleDate('a1', '2026-1-5');
      api?.toggleDate('a1', '');
    });

    expect(completed()).toEqual([]);
  });

  it('leaves other habits untouched', () => {
    store.set(
      HABITS_KEY,
      JSON.stringify([
        {
          id: 'a1',
          name: 'Первая',
          createdAt: '2026-01-01T00:00:00.000Z',
          completedDates: [],
        },
        {
          id: 'a2',
          name: 'Вторая',
          createdAt: '2026-01-01T00:00:00.000Z',
          completedDates: [],
        },
      ]),
    );

    renderProvider();

    act(() => {
      api?.toggleDate('a1', '2026-01-05');
    });

    expect(api?.habits[0].completedDates).toEqual(['2026-01-05']);
    expect(api?.habits[1].completedDates).toEqual([]);
  });
});

describe('HabitsProvider permission handling', () => {
  it('reports denial and clears it once granted', async () => {
    setAuthorizationStatus(AUTHORIZATION_STATUS.DENIED);

    await renderProviderAsync();

    let granted: boolean | undefined;

    await act(async () => {
      granted = await api?.ensureReminderPermission();
    });

    expect(granted).toBe(false);
    expect(api?.reminderError).not.toBeNull();

    setAuthorizationStatus(AUTHORIZATION_STATUS.AUTHORIZED);

    await act(async () => {
      granted = await api?.ensureReminderPermission();
    });

    expect(granted).toBe(true);
    expect(api?.reminderError).toBeNull();
  });
});

describe('HabitsProvider id generation', () => {
  it('never stores two habits with the same id', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1767225600000);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    renderProvider();

    act(() => {
      api?.addHabit({ name: 'Первая' });
    });
    act(() => {
      api?.addHabit({ name: 'Вторая' });
    });
    act(() => {
      api?.addHabit({ name: 'Третья' });
    });

    const persisted = readPayload() as Array<{ id: string }>;
    const ids = new Set(persisted.map(habit => habit.id));

    expect(persisted).toHaveLength(3);
    expect(ids.size).toBe(3);
  });

  it('keeps mutations scoped to a single habit', () => {
    renderProvider();

    act(() => {
      api?.addHabit({ name: 'Первая' });
    });
    act(() => {
      api?.addHabit({ name: 'Вторая' });
    });

    const [first, second] = api!.habits;

    act(() => {
      api?.toggleToday(first.id);
    });

    expect(api?.habits.find(habit => habit.id === first.id)?.completedDates)
      .toHaveLength(1);
    expect(api?.habits.find(habit => habit.id === second.id)?.completedDates)
      .toHaveLength(0);
  });

  it('deletes only the requested habit', () => {
    renderProvider();

    act(() => {
      api?.addHabit({ name: 'Первая' });
    });
    act(() => {
      api?.addHabit({ name: 'Вторая' });
    });

    const target = api!.habits[0];

    act(() => {
      api?.deleteHabit(target.id);
    });

    expect(api?.habits.map(habit => habit.name)).toEqual([
      api!.habits[0].name,
    ]);
    expect(api?.habits).toHaveLength(1);
    expect(api?.habits[0].id).not.toBe(target.id);
  });
});
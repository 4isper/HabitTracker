/**
 * @format
 */

import * as notifee from '@notifee/react-native';

import {
  cancelHabitReminder,
  getReminderNotificationId,
  requestNotificationPermission,
  scheduleHabitReminder,
  syncHabitReminders,
} from '../src/notifications/reminders';

import type { Habit } from '../src/types/habit';

type MockedNotifee = {
  __scheduled: Map<string, { notification: unknown; trigger: unknown }>;
  __setAuthorizationStatus: (status: number) => void;
  __reset: () => void;
  default: Record<string, jest.Mock>;
  AlarmType: Record<string, number>;
  RepeatFrequency: Record<string, number>;
  TriggerType: Record<string, number>;
  AuthorizationStatus: Record<string, number>;
};

const mock = notifee as unknown as MockedNotifee;

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'a1',
    name: 'Пить воду',
    createdAt: '2026-01-01T00:00:00.000Z',
    completedDates: [],
    ...overrides,
  };
}

function scheduledEntry(id: string): {
  notification: unknown;
  trigger: unknown;
} {
  const entry = mock.__scheduled.get(id);

  if (!entry) {
    throw new Error(`nothing scheduled for ${id}`);
  }

  return entry;
}

beforeEach(() => {
  mock.__reset();
  mock.default.requestPermission.mockClear();
  mock.default.createChannel.mockClear();
  mock.default.createTriggerNotification.mockClear();
  mock.default.cancelTriggerNotification.mockClear();
  mock.default.cancelTriggerNotifications.mockClear();
  mock.default.getTriggerNotificationIds.mockClear();
  mock.__setAuthorizationStatus(mock.AuthorizationStatus.AUTHORIZED);
});

describe('getReminderNotificationId', () => {
  it('namespaces the habit id', () => {
    expect(getReminderNotificationId('a1')).toBe('habit-reminder-a1');
  });
});

describe('requestNotificationPermission', () => {
  it('reports granted when authorized', async () => {
    mock.__setAuthorizationStatus(mock.AuthorizationStatus.AUTHORIZED);

    await expect(requestNotificationPermission()).resolves.toBe(true);
  });

  it('reports denied otherwise', async () => {
    mock.__setAuthorizationStatus(mock.AuthorizationStatus.DENIED);

    await expect(requestNotificationPermission()).resolves.toBe(false);
  });
});

describe('scheduleHabitReminder', () => {
  it('creates a daily alarm on the Android channel', async () => {
    await scheduleHabitReminder(habit({ reminderTime: '09:00' }));

    const id = getReminderNotificationId('a1');

    expect(mock.default.createChannel).toHaveBeenCalledTimes(1);
    expect(mock.__scheduled.has(id)).toBe(true);

    const { notification, trigger } = scheduledEntry(id);

    expect(notification).toMatchObject({
      id,
      android: { channelId: 'habit-reminders', pressAction: { id: 'default' } },
    });

    expect(trigger).toMatchObject({
      type: mock.TriggerType.TIMESTAMP,
      repeatFrequency: mock.RepeatFrequency.DAILY,
      alarmManager: {
        type: mock.AlarmType.SET_AND_ALLOW_WHILE_IDLE,
      },
    });
  });

  it('schedules into the future', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15, 10, 0, 0));

    await scheduleHabitReminder(habit({ reminderTime: '08:00' }));

    const { trigger } = scheduledEntry(getReminderNotificationId('a1'));

    expect(trigger).toMatchObject({
      timestamp: new Date(2026, 0, 16, 8, 0, 0).getTime(),
    });

    jest.useRealTimers();
  });

  it('interpolates the habit name into the title', async () => {
    await scheduleHabitReminder(habit({ reminderTime: '09:00' }));

    const { notification } = scheduledEntry(getReminderNotificationId('a1'));

    expect(notification).toMatchObject({ title: 'Пора: Пить воду' });
  });

  it('never requests an exact alarm', async () => {
    await scheduleHabitReminder(habit({ reminderTime: '09:00' }));

    const { trigger } = scheduledEntry(getReminderNotificationId('a1'));

    expect(trigger).not.toMatchObject({
      alarmManager: { type: mock.AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE },
    });
  });

  it('cancels instead of scheduling when the habit has no reminder', async () => {
    const result = await scheduleHabitReminder(habit());

    expect(result).toBe(false);
    expect(mock.default.createTriggerNotification).not.toHaveBeenCalled();
    expect(mock.default.cancelTriggerNotification).toHaveBeenCalledWith(
      getReminderNotificationId('a1'),
    );
  });
});

describe('cancelHabitReminder', () => {
  it('removes the scheduled alarm', async () => {
    await scheduleHabitReminder(habit({ reminderTime: '09:00' }));
    await cancelHabitReminder('a1');

    expect(mock.__scheduled.has(getReminderNotificationId('a1'))).toBe(false);
  });
});

describe('syncHabitReminders', () => {
  it('schedules only habits that have a reminder', async () => {
    await syncHabitReminders([
      habit({ id: 'a1', reminderTime: '09:00' }),
      habit({ id: 'a2' }),
      habit({ id: 'a3', reminderTime: '21:30' }),
    ]);

    expect([...mock.__scheduled.keys()].sort()).toEqual([
      getReminderNotificationId('a1'),
      getReminderNotificationId('a3'),
    ]);
  });

  it('drops alarms for habits that no longer exist', async () => {
    await scheduleHabitReminder(habit({ id: 'gone', reminderTime: '09:00' }));

    await syncHabitReminders([habit({ id: 'a1', reminderTime: '09:00' })]);

    expect([...mock.__scheduled.keys()]).toEqual([getReminderNotificationId('a1')]);
  });

  it('drops alarms for habits whose reminder was switched off', async () => {
    await scheduleHabitReminder(habit({ id: 'a1', reminderTime: '09:00' }));

    await syncHabitReminders([habit({ id: 'a1' })]);

    expect(mock.__scheduled.size).toBe(0);
  });

  it('leaves alarms it does not own alone', async () => {
    mock.__scheduled.set('someone-elses-alarm', {
      notification: {},
      trigger: {},
    });

    await syncHabitReminders([habit({ reminderTime: '09:00' })]);

    expect(mock.__scheduled.has('someone-elses-alarm')).toBe(true);
  });

  it('replaces a rescheduled time rather than keeping the old alarm', async () => {
    await scheduleHabitReminder(habit({ id: 'a1', reminderTime: '09:00' }));

    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15, 10, 0, 0));
    await syncHabitReminders([habit({ id: 'a1', reminderTime: '18:00' })]);
    jest.useRealTimers();

    const entries = [...mock.__scheduled.values()];

    expect(entries).toHaveLength(1);
    expect(entries[0].trigger).toMatchObject({
      timestamp: new Date(2026, 0, 15, 18, 0, 0).getTime(),
    });
  });

  it('is idempotent across repeated launches', async () => {
    const habits = [
      habit({ id: 'a1', reminderTime: '09:00' }),
      habit({ id: 'a2', reminderTime: '13:00' }),
    ];

    await syncHabitReminders(habits);
    await syncHabitReminders(habits);
    await syncHabitReminders(habits);

    expect(mock.__scheduled.size).toBe(2);
  });
});
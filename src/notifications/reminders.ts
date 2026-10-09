import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';

import i18n from '../i18n';
import { getNextReminderDate } from '../utils/time';

import type { Habit } from '../types/habit';
import type { TimestampTrigger } from '@notifee/react-native/dist/types/Trigger';

const CHANNEL_ID = 'habit-reminders';
const NOTIFICATION_PREFIX = 'habit-reminder-';

/**
 * Inexact alarm: `SET_AND_ALLOW_WHILE_IDLE` fires in doze mode without the
 * `SCHEDULE_EXACT_ALARM` permission, which Google Play treats as a special-use
 * permission requiring justification. A habit nudge that lands a few minutes
 * late is preferable to a policy rejection.
 */
const ALARM_TYPE = AlarmType.SET_AND_ALLOW_WHILE_IDLE;

export function getReminderNotificationId(habitId: string): string {
  return `${NOTIFICATION_PREFIX}${habitId}`;
}

function isManagedNotification(id: string): boolean {
  return id.startsWith(NOTIFICATION_PREFIX);
}

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();

  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

async function ensureChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: i18n.t('notifications.channelName'),
    importance: AndroidImportance.DEFAULT,
  });
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await notifee.cancelTriggerNotification(getReminderNotificationId(habitId));
}

export async function scheduleHabitReminder(habit: Habit): Promise<boolean> {
  if (!habit.reminderTime) {
    await cancelHabitReminder(habit.id);

    return false;
  }

  await ensureChannel();

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: getNextReminderDate(habit.reminderTime).getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
    alarmManager: { type: ALARM_TYPE },
  };

  await notifee.createTriggerNotification(
    {
      id: getReminderNotificationId(habit.id),
      title: i18n.t('notifications.title', { name: habit.name }),
      body: i18n.t('notifications.body'),
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );

  return true;
}

/**
 * Replaces the whole managed set with what `habits` currently says.
 *
 * Reconciling by diffing against the live trigger ids is what makes this safe to
 * call on every launch: alarms are lost on device reboot, and habits can be
 * renamed, retimed or deleted while the app is closed, leaving stale schedules
 * behind that no other call site would notice.
 */
export async function syncHabitReminders(habits: Habit[]): Promise<void> {
  const scheduledIds = (await notifee.getTriggerNotificationIds()).filter(
    isManagedNotification,
  );

  await notifee.cancelTriggerNotifications(scheduledIds);

  for (const habit of habits) {
    await scheduleHabitReminder(habit);
  }
}
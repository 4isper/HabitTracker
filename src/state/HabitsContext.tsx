import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'react-i18next';

import type { ReactNode } from 'react';

import type {
  AddHabitResult,
  CreateHabitInput,
  Habit,
  UpdateHabitInput,
  UpdateHabitResult,
} from '../types/habit';

import { loadHabits, saveHabits } from '../storage/habitsStorage';
import {
  requestNotificationPermission,
  syncHabitReminders,
} from '../notifications/reminders';
import { formatDateKey, getTodayKey, isValidDateKey } from '../utils/date';
import { createId } from '../utils/id';

type HabitsContextValue = {
  habits: Habit[];
  saveError: string | null;
  reminderError: string | null;
  addHabit: (input: CreateHabitInput) => AddHabitResult;
  toggleToday: (habitId: string) => void;
  toggleDate: (habitId: string, dateKey: string) => void;
  deleteHabit: (habitId: string) => void;
  isDuplicateName: (name: string, excludeId?: string) => boolean;
  getHabitById: (habitId: string) => Habit | undefined;
  updateHabit: (habitId: string, input: UpdateHabitInput) => UpdateHabitResult;
  ensureReminderPermission: () => Promise<boolean>;
};

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  const [initialLoad] = useState(() => loadHabits());
  const [habits, setHabits] = useState<Habit[]>(initialLoad.habits);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);

  /**
   * A failed load means storage held data we could not parse and `habits` is an
   * empty placeholder, not the truth. Persisting it on mount would overwrite
   * the only copy of the user's data, so the first effect is skipped and only
   * real user-driven changes write back.
   */
  const skipNextPersistRef = useRef(initialLoad.status === 'failed');

  useEffect(() => {
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    const ok = saveHabits(habits);

    setSaveError(ok ? null : t('storage.saveError'));
  }, [habits, t]);

  /**
   * Reminders are reconciled from a signature of only the fields a schedule
   * depends on. Re-syncing on every `habits` change would tear down and rebuild
   * every alarm each time the user taps a checkbox.
   *
   * Alarms do not survive a reboot and the app can be killed while a habit is
   * renamed, retimed or deleted, so this also runs on mount to repair whatever
   * the OS lost.
   */
  const habitsRef = useRef(habits);

  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  const reminderSignature = useMemo(
    () =>
      habits
        .map(habit => `${habit.id}|${habit.name}|${habit.reminderTime ?? ''}`)
        .join('||'),
    [habits],
  );

  useEffect(() => {
    syncHabitReminders(habitsRef.current).catch(error => {
      console.warn(t('notifications.syncFailed'), error);
    });
  }, [reminderSignature, t]);

  const ensureReminderPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();

    setReminderError(granted ? null : t('notifications.permissionDenied'));

    return granted;
  }, [t]);

  const isDuplicateName = useCallback(
    (name: string, excludeId?: string) => {
      const normalizedName = name.trim().toLowerCase();

      if (!normalizedName) {
        return false;
      }

      return habits.some(
        (habit) =>
          habit.id !== excludeId &&
          habit.name.trim().toLowerCase() === normalizedName
      );
    },
    [habits]
  );

  const addHabit = useCallback(
    (input: CreateHabitInput): AddHabitResult => {
      const name = input.name.trim();

      if (!name) {
        return {
          success: false,
          error: 'empty',
        };
      }

      if (isDuplicateName(name)) {
        return {
          success: false,
          error: 'duplicate',
        };
      }

      const habit: Habit = {
        id: createId(),
        name,
        emoji: input.emoji?.trim() || undefined,
        color: input.color || undefined,
        reminderTime: input.reminderTime,
        createdAt: new Date().toISOString(),
        completedDates: [],
      };

      setHabits((prevHabits) => {
        let candidate = habit;

        while (prevHabits.some(existing => existing.id === candidate.id)) {
          candidate = { ...candidate, id: createId() };
        }

        return [candidate, ...prevHabits];
      });

      return {
        success: true,
      };
    },
    [isDuplicateName]
  );

  const updateHabit = useCallback(
    (habitId: string, input: UpdateHabitInput): UpdateHabitResult => {
      const habitExists = habits.some((habit) => habit.id === habitId);

      if (!habitExists) {
        return {
          success: false,
          error: 'notFound',
        };
      }

      const name = input.name.trim();

      if (!name) {
        return {
          success: false,
          error: 'empty',
        };
      }

      if (isDuplicateName(name, habitId)) {
        return {
          success: false,
          error: 'duplicate',
        };
      }

      setHabits((prevHabits) =>
        prevHabits.map((habit) => {
          if (habit.id !== habitId) {
            return habit;
          }

          return {
            ...habit,
            name,
            emoji: input.emoji?.trim() || undefined,
            color: input.color || undefined,
            reminderTime: input.reminderTime,
          };
        })
      );

      return {
        success: true,
      };
    },
    [habits, isDuplicateName]
  );

  const toggleToday = useCallback((habitId: string) => {
    const todayKey = getTodayKey();

    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        const alreadyCompleted = habit.completedDates.includes(todayKey);

        return {
          ...habit,
          completedDates: alreadyCompleted
            ? habit.completedDates.filter((date) => date !== todayKey)
            : [...habit.completedDates, todayKey],
        };
      })
    );
  }, []);

  const toggleDate = useCallback((habitId: string, dateKey: string) => {
    const todayKey = getTodayKey();

    if (!isValidDateKey(dateKey) || dateKey > todayKey) {
      return;
    }

    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== habitId) {
          return habit;
        }

        // A habit cannot be completed on a day it did not exist, and marking
        // one would inflate the rate above 100%.
        if (dateKey < formatDateKey(new Date(habit.createdAt))) {
          return habit;
        }

        const alreadyCompleted = habit.completedDates.includes(dateKey);

        return {
          ...habit,
          completedDates: alreadyCompleted
            ? habit.completedDates.filter(date => date !== dateKey)
            : [...habit.completedDates, dateKey].sort(),
        };
      }),
    );
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.filter((habit) => habit.id !== habitId)
    );
  }, []);

  const getHabitById = useCallback(
    (habitId: string) => habits.find((habit) => habit.id === habitId),
    [habits]
  );

const value = useMemo(
    () => ({
      habits,
      saveError,
      reminderError,
      addHabit,
      toggleToday,
      toggleDate,
      deleteHabit,
      isDuplicateName,
      getHabitById,
      updateHabit,
      ensureReminderPermission,
    }),
    [
      habits,
      saveError,
      reminderError,
      addHabit,
      toggleToday,
      toggleDate,
      deleteHabit,
      isDuplicateName,
      getHabitById,
      updateHabit,
      ensureReminderPermission,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);
  const { t } = useTranslation();

  if (!context) {
    throw new Error(t('context.providerError'));
  }

  return context;
}
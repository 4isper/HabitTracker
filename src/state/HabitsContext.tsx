import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

import type {
  AddHabitResult,
  CreateHabitInput,
  Habit,
} from '../types/habit';

import { loadHabits, saveHabits } from '../storage/habitsStorage';
import { getTodayKey } from '../utils/date';

type HabitsContextValue = {
  habits: Habit[];
  saveError: string | null;
  addHabit: (input: CreateHabitInput) => AddHabitResult;
  toggleToday: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  isDuplicateName: (name: string) => boolean;
  getHabitById: (habitId: string) => Habit | undefined;
};

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const ok = saveHabits(habits);

    setSaveError(ok ? null : 'Не удалось сохранить данные');
  }, [habits]);

  const isDuplicateName = useCallback(
    (name: string) => {
      const normalizedName = name.trim().toLowerCase();

      if (!normalizedName) {
        return false;
      }

      return habits.some(
        (habit) => habit.name.trim().toLowerCase() === normalizedName
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
        id: Date.now().toString(),
        name,
        emoji: input.emoji?.trim() || undefined,
        color: input.color || undefined,
        createdAt: new Date().toISOString(),
        completedDates: [],
      };

      setHabits((prevHabits) => [habit, ...prevHabits]);

      return {
        success: true,
      };
    },
    [isDuplicateName]
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
      addHabit,
      toggleToday,
      deleteHabit,
      isDuplicateName,
      getHabitById,
    }),
    [
      habits,
      saveError,
      addHabit,
      toggleToday,
      deleteHabit,
      isDuplicateName,
      getHabitById,
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits должен использоваться внутри HabitsProvider');
  }

  return context;
}
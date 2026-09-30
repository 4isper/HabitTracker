export type Habit = {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  createdAt: string;
  completedDates: string[];
};

export type CreateHabitInput = {
  name: string;
  emoji?: string;
  color?: string;
};

export type AddHabitError = 'empty' | 'duplicate';

export type AddHabitResult = {
  success: boolean;
  error?: AddHabitError;
};

export type UpdateHabitInput = CreateHabitInput;

export type UpdateHabitError = AddHabitError | 'notFound';

export type UpdateHabitResult = {
  success: boolean;
  error?: UpdateHabitError;
};

export type HabitFilter = 'all' | 'completed' | 'pending';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HabitForm } from '../components/HabitForm';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';

import type { CreateHabitInput } from '../types/habit';
import type { RootStackParamList } from '../navigation/types';

type EditHabitScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditHabit'
>;

export function EditHabitScreen({
  route,
  navigation,
}: EditHabitScreenProps) {
  const { habitId } = route.params;

  const { getHabitById, updateHabit } = useHabits();

  const habit = getHabitById(habitId);

  if (!habit) {
    return (
      <Screen>
        <ScreenHeader
          title="Привычка не найдена"
          onBack={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const handleSubmit = (input: CreateHabitInput) => {
    const result = updateHabit(habitId, input);

    if (result.success) {
      navigation.goBack();
    }

    return result;
  };

  return (
    <Screen>
      <ScreenHeader
        title="Редактировать привычку"
        onBack={() => navigation.goBack()}
      />

      <HabitForm
        initialValues={{
          name: habit.name,
          emoji: habit.emoji,
          color: habit.color,
        }}
        submitLabel="Сохранить"
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </Screen>
  );
}
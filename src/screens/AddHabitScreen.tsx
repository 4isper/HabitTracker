import { useTranslation } from 'react-i18next';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HabitForm } from '../components/HabitForm';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';

import type { CreateHabitInput } from '../types/habit';
import type { RootStackParamList } from '../navigation/types';

type AddHabitScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddHabit'
>;

export function AddHabitScreen({ navigation }: AddHabitScreenProps) {
  const { addHabit } = useHabits();
  const { t } = useTranslation();

  const handleSubmit = (input: CreateHabitInput) => {
    const result = addHabit(input);

    if (result.success) {
      navigation.goBack();
    }

    return result;
  };

  return (
    <Screen>
      <ScreenHeader
        title={t('nav.addHabit')}
        onBack={() => navigation.goBack()}
      />

      <HabitForm
        submitLabel={t('common.add')}
        onSubmit={handleSubmit}
        onCancel={() => navigation.goBack()}
      />
    </Screen>
  );
}
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HabitCard } from '../components/HabitCard';
import { CircleButton } from '../components/CircleButton';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';
import { getTodayKey } from '../utils/date';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

import type { Habit } from '../types/habit';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { habits, toggleToday, saveError } = useHabits();
  const theme = useAppTheme();

  const todayKey = getTodayKey();

  const renderItem = ({ item }: { item: Habit }) => {
    const completedToday = item.completedDates.includes(todayKey);

    return (
      <HabitCard
        habit={item}
        completedToday={completedToday}
        onPress={() =>
          navigation.navigate('HabitDetails', {
            habitId: item.id,
          })
        }
        onToggleToday={() => toggleToday(item.id)}
      />
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title="Мои привычки"
        right={
          <CircleButton
            accessibilityLabel="Добавить привычку"
            onPress={() => navigation.navigate('AddHabit')}
            style={{
              backgroundColor: theme.colors.primary,
            }}
          >
            <Icon name="add" color={theme.colors.primaryText} />
          </CircleButton>
        }
      />

      {saveError ? (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.danger,
            },
          ]}
        >
          {saveError}
        </Text>
      ) : null}

      <FlatList
        style={styles.list}
        data={habits}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Привычек пока нет
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: theme.colors.textMuted,
                },
              ]}
            >
              Добавьте первую привычку, чтобы начать отслеживать прогресс.
            </Text>

            <Pressable
              style={[
                styles.emptyButton,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => navigation.navigate('AddHabit')}
            >
              <Text
                style={[
                  styles.emptyButtonText,
                  {
                    color: theme.colors.primaryText,
                  },
                ]}
              >
                Добавить привычку
              </Text>
            </Pressable>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.huge,
  },
  emptyState: {
    marginTop: spacing.huge * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    fontWeight: '600',
  },
});

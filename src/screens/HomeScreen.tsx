import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HabitCard } from '../components/HabitCard';
import { CircleButton } from '../components/CircleButton';
import { FilterTabs } from '../components/FilterTabs';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';
import { getTodayKey } from '../utils/date';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

import type { Habit, HabitFilter } from '../types/habit';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const EMPTY_FILTER_TITLES: Record<HabitFilter, { title: string; text: string }> = {
  all: {
    title: 'Привычек пока нет',
    text: 'Добавьте первую привычку, чтобы начать отслеживать прогресс.',
  },
  completed: {
    title: 'Нет выполненных привычек',
    text: 'Отметьте выполненную привычку, и она появится здесь.',
  },
  pending: {
    title: 'Все привычки выполнены',
    text: 'Все привычки на сегодня уже отмечены. Отличная работа!',
  },
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { habits, toggleToday, saveError } = useHabits();
  const theme = useAppTheme();

  const [filter, setFilter] = useState<HabitFilter>('all');

  const todayKey = getTodayKey();

  const { completedIds, visibleHabits, counts } = useMemo(() => {
    const completed = new Set<string>();

    for (const habit of habits) {
      if (habit.completedDates.includes(todayKey)) {
        completed.add(habit.id);
      }
    }

    const filtered =
      filter === 'all'
        ? habits
        : habits.filter(habit =>
            filter === 'completed'
              ? completed.has(habit.id)
              : !completed.has(habit.id)
          );

    return {
      completedIds: completed,
      visibleHabits: filtered,
      counts: {
        all: habits.length,
        completed: completed.size,
        pending: habits.length - completed.size,
      },
    };
  }, [habits, filter, todayKey]);

  const renderItem = ({ item }: { item: Habit }) => {
    return (
      <HabitCard
        habit={item}
        completedToday={completedIds.has(item.id)}
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

      <FilterTabs value={filter} onChange={setFilter} counts={counts} />

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
        data={visibleHabits}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {EMPTY_FILTER_TITLES.all.title}
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {EMPTY_FILTER_TITLES.all.text}
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
          ) : (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {EMPTY_FILTER_TITLES[filter].title}
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {EMPTY_FILTER_TITLES[filter].text}
              </Text>

              <Pressable
                style={[
                  styles.emptyButton,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                  },
                ]}
                onPress={() => setFilter('all')}
              >
                <Text
                  style={[
                    styles.emptyButtonText,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                >
                  Показать все
                </Text>
              </Pressable>
            </View>
          )
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

import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
import { radii } from '../theme/radii';
import { text } from '../theme/typography';

import type { Habit, HabitFilter } from '../types/habit';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const EMPTY_FILTER_KEYS = {
  all: {
    title: 'home.emptyAll.title',
    text: 'home.emptyAll.text',
  },
  completed: {
    title: 'home.emptyCompleted.title',
    text: 'home.emptyCompleted.text',
  },
  pending: {
    title: 'home.emptyPending.title',
    text: 'home.emptyPending.text',
  },
} as const satisfies Record<HabitFilter, { title: string; text: string }>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { habits, toggleToday, saveError } = useHabits();
  const theme = useAppTheme();
  const { t } = useTranslation();

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
        title={t('home.title')}
        right={
          <CircleButton
            accessibilityLabel={t('home.addHabitA11y')}
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
                {t(EMPTY_FILTER_KEYS.all.title)}
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {t(EMPTY_FILTER_KEYS.all.text)}
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
                  {t('home.addHabit')}
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
                {t(EMPTY_FILTER_KEYS[filter].title)}
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {t(EMPTY_FILTER_KEYS[filter].text)}
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
                  {t('home.showAll')}
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
    marginBottom: spacing.md,
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
    ...text.title,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...text.bodySm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    borderRadius: radii.control,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyButtonText: {
    fontWeight: '600',
  },
});

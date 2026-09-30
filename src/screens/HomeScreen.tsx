import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HabitCard } from '../components/HabitCard';
import { useHabits } from '../state/HabitsContext';
import { getTodayKey } from '../utils/date';
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Мои привычки
        </Text>

        <Pressable
          style={[
            styles.addButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => navigation.navigate('AddHabit')}
        >
          <Text
            style={[
              styles.addButtonText,
              {
                color: theme.colors.primaryText,
              },
            ]}
          >
            +
          </Text>
        </Pressable>
      </View>

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
        data={habits}
        keyExtractor={(item) => item.id}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  error: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    marginTop: 80,
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
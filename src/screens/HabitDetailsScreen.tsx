import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useHabits } from '../state/HabitsContext';
import { formatDateForDisplay, getTodayKey } from '../utils/date';
import { useAppTheme } from '../theme/appTheme';

import type { RootStackParamList } from '../navigation/types';

type HabitDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'HabitDetails'
>;

export function HabitDetailsScreen({
  route,
  navigation,
}: HabitDetailsScreenProps) {
  const { habitId } = route.params;

  const { getHabitById, toggleToday } = useHabits();
  const theme = useAppTheme();

  const habit = getHabitById(habitId);

  if (!habit) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.notFoundText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Привычка не найдена
        </Text>

        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={[
              styles.backButtonText,
              {
                color: theme.colors.primaryText,
              },
            ]}
          >
            Назад
          </Text>
        </Pressable>
      </View>
    );
  }

  const todayKey = getTodayKey();

  const completedToday = habit.completedDates.includes(todayKey);

  const history = [...habit.completedDates].sort((a, b) => b.localeCompare(a));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderLeftColor: habit.color ?? theme.colors.textMuted,
          },
        ]}
      >
        <Text style={styles.emoji}>{habit.emoji || '🌱'}</Text>

        <Text
          style={[
            styles.name,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {habit.name}
        </Text>

        <Text
          style={[
            styles.status,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {completedToday ? 'Выполнено сегодня' : 'Не выполнено сегодня'}
        </Text>

        <Text
          style={[
            styles.total,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Всего выполнений: {history.length}
        </Text>
      </View>

      <Pressable
        style={[
          styles.toggleButton,
          {
            backgroundColor: theme.colors.success,
          },
        ]}
        onPress={() => toggleToday(habit.id)}
      >
        <Text
          style={[
            styles.toggleButtonText,
            {
              color: theme.colors.primaryText,
            },
          ]}
        >
          {completedToday ? 'Снять отметку' : 'Отметить сегодня'}
        </Text>
      </Pressable>

      <Text
        style={[
          styles.historyTitle,
          {
            color: theme.colors.text,
          },
        ]}
      >
        История выполнения
      </Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.historyList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.historyItem,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.historyDate,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {formatDateForDisplay(item)}
            </Text>

            <Text
              style={[
                styles.historyStatus,
                {
                  color: theme.colors.success,
                },
              ]}
            >
              Выполнено
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={[
              styles.emptyHistory,
              {
                color: theme.colors.textMuted,
              },
            ]}
          >
            Пока нет выполненных дней
          </Text>
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
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: '600',
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 20,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
  },
  total: {
    fontSize: 14,
  },
  toggleButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyList: {
    paddingBottom: 40,
  },
  historyItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 15,
  },
  historyStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyHistory: {
    fontSize: 14,
    marginTop: 12,
  },
});
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme/appTheme';

import type { Habit } from '../types/habit';

type HabitCardProps = {
  habit: Habit;
  completedToday: boolean;
  onPress: () => void;
  onToggleToday: () => void;
};

export function HabitCard({
  habit,
  completedToday,
  onPress,
  onToggleToday,
}: HabitCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: completedToday
            ? theme.colors.completedBackground
            : theme.colors.surface,
          borderColor: theme.colors.border,
          borderLeftColor: habit.color ?? theme.colors.textMuted,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={styles.emoji}>{habit.emoji || '🌱'}</Text>

        <View style={styles.textBlock}>
          <Text
            style={[
              styles.name,
              {
                color: completedToday
                  ? theme.colors.textMuted
                  : theme.colors.text,
              },
              completedToday && styles.nameCompleted,
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
            {completedToday ? 'Выполнено' : 'Не выполнено'}
          </Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.checkbox,
          {
            backgroundColor: completedToday
              ? theme.colors.success
              : theme.colors.surface,
            borderColor: completedToday
              ? theme.colors.success
              : theme.colors.border,
          },
        ]}
        onPress={onToggleToday}
        hitSlop={10}
      >
        {completedToday ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : null}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 26,
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
  },
  status: {
    fontSize: 13,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
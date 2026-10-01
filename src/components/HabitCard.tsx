import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { useAppTheme } from '../theme/appTheme';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { emojiSize, text } from '../theme/typography';
import { motion } from '../theme/motion';

import type { Habit } from '../types/habit';

const HIT_SLOP = 10;

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
  const { t } = useTranslation();

  const scale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(
    new Animated.Value(completedToday ? 1 : 0),
  ).current;

  useEffect(() => {
    if (completedToday) {
      scale.setValue(motion.pop.scale);
    }

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(checkOpacity, {
        toValue: completedToday ? 1 : 0,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkOpacity, completedToday, scale]);

  return (
    <Touchable
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
            {t(completedToday ? 'habitCard.completed' : 'habitCard.pending')}
          </Text>
        </View>
      </View>

      <Animated.View style={[styles.checkboxScale, { transform: [{ scale }] }]}>
        <Touchable
          accessibilityLabel={t(
            completedToday ? 'habitCard.unmarkToday' : 'habitCard.markToday'
          )}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completedToday }}
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
          hitSlop={HIT_SLOP}
        >
          <Animated.View style={{ opacity: checkOpacity }}>
            <Icon
              name="check"
              color={theme.colors.primaryText}
              size={18}
              strokeWidth={3}
            />
          </Animated.View>
        </Touchable>
      </Animated.View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: emojiSize.md,
    marginRight: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    ...text.buttonSm,
    marginBottom: spacing.xxs,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
  },
  status: {
    ...text.caption,
  },
  checkboxScale: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
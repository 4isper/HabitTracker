import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { Touchable } from '../components/Touchable';
import { ProgressBar } from '../components/ProgressBar';
import { StatsRow } from '../components/StatsRow';
import { HabitCalendar } from '../components/HabitCalendar';
import { useHabits } from '../state/HabitsContext';
import { useTodayKey } from '../hooks/useTodayKey';
import { getHabitStats } from '../utils/stats';
import { controlPadding, spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';
import { radii } from '../theme/radii';
import { emojiSize, text } from '../theme/typography';

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

  const {
    getHabitById,
    toggleToday,
    toggleDate,
    deleteHabit,
  } = useHabits();
  const theme = useAppTheme();
  const { t } = useTranslation();
  const todayKey = useTodayKey();

  const habit = getHabitById(habitId);

  if (!habit) {
    return (
      <Screen>
        <ScreenHeader
          title={t('common.notFoundTitle')}
          onBack={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const completedToday = habit.completedDates.includes(todayKey);

  const stats = getHabitStats(habit.completedDates, habit.createdAt, todayKey);

  const handleDelete = () => {
    Alert.alert(
      t('habitDetails.deleteTitle'),
      t('habitDetails.deleteMessage', { name: habit.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            navigation.popToTop();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title={t('habitDetails.title')}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
            {t(
              completedToday
                ? 'habitDetails.statusCompleted'
                : 'habitDetails.statusPending',
            )}
          </Text>

          <ProgressBar progress={stats.completionRate} />

          <StatsRow stats={stats} />
        </View>

        <Touchable
          animateScale
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
            {t(
              completedToday
                ? 'habitDetails.unmarkToday'
                : 'habitDetails.markToday',
            )}
          </Text>
        </Touchable>

        <Touchable
          style={[
            styles.editButton,
            {
              backgroundColor: theme.colors.control,
            },
          ]}
          onPress={() =>
            navigation.navigate('EditHabit', {
              habitId: habit.id,
            })
          }
        >
          <Text
            style={[
              styles.editButtonText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {t('habitDetails.edit')}
          </Text>
        </Touchable>

        <Touchable
          style={[
            styles.deleteButton,
            {
              backgroundColor: theme.colors.danger,
            },
          ]}
          onPress={handleDelete}
        >
          <Text
            style={[
              styles.deleteButtonText,
              {
                color: theme.colors.primaryText,
              },
            ]}
          >
            {t('habitDetails.delete')}
          </Text>
        </Touchable>

        <Text
          style={[
            styles.historyTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {t('habitDetails.historyTitle')}
        </Text>

        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <HabitCalendar
            completedDates={habit.completedDates}
            createdAt={habit.createdAt}
            onToggleDate={dateKey => toggleDate(habit.id, dateKey)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: emojiSize.lg,
    marginBottom: spacing.xs,
  },
  name: {
    ...text.heading,
    marginBottom: spacing.xs,
  },
  status: {
    ...text.bodySm,
    marginBottom: spacing.sm,
  },
  toggleButton: {
    borderRadius: radii.card,
    paddingVertical: controlPadding.button,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  toggleButtonText: {
    ...text.button,
  },
  editButton: {
    borderRadius: radii.card,
    paddingVertical: controlPadding.button,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editButtonText: {
    ...text.button,
  },
  deleteButton: {
    borderRadius: radii.card,
    paddingVertical: controlPadding.button,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  deleteButtonText: {
    ...text.button,
  },
  historyTitle: {
    ...text.title,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.huge,
  },
  calendarCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.md,
  },
});

import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';
import { formatDateForDisplay, getTodayKey } from '../utils/date';
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

  const { getHabitById, toggleToday, deleteHabit } = useHabits();
  const theme = useAppTheme();
  const { t } = useTranslation();

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

  const todayKey = getTodayKey();

  const completedToday = habit.completedDates.includes(todayKey);

  const history = [...habit.completedDates].sort((a, b) => b.localeCompare(a));

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
      ]
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title={t('habitDetails.title')}
        onBack={() => navigation.goBack()}
      />

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
              : 'habitDetails.statusPending'
          )}
        </Text>

        <Text
          style={[
            styles.total,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {t('habitDetails.total', { value: history.length })}
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
          {t(
            completedToday ? 'habitDetails.unmarkToday' : 'habitDetails.markToday'
          )}
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.editButton,
          {
            backgroundColor: theme.colors.surfaceAlt,
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
      </Pressable>

      <Pressable
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
      </Pressable>

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

      <FlatList
        style={styles.historyList}
        data={history}
        keyExtractor={item => item}
        contentContainerStyle={styles.historyListContent}
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
              {t('habitDetails.historyItemStatus')}
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
            {t('habitDetails.emptyHistory')}
          </Text>
        }
      />
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
  total: {
    ...text.bodySm,
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
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: spacing.huge,
  },
  historyItem: {
    borderRadius: radii.control,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyDate: {
    ...text.body,
  },
  historyStatus: {
    ...text.captionStrong,
  },
  emptyHistory: {
    ...text.bodySm,
    marginTop: spacing.md,
  },
});

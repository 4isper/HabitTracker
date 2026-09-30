import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';
import { formatDateForDisplay, getTodayKey } from '../utils/date';
import { spacing } from '../theme/spacing';
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
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing.xl,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xxl,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  editButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: spacing.huge,
  },
  historyItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
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

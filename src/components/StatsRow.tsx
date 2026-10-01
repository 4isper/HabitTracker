import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '../theme/appTheme';
import { spacing } from '../theme/spacing';
import { text } from '../theme/typography';

import type { HabitStats } from '../utils/stats';

type StatsRowProps = {
  stats: HabitStats;
};

export function StatsRow({ stats }: StatsRowProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const items = [
    { label: t('habitDetails.statRate'), value: `${stats.completionRate}%` },
    {
      label: t('habitDetails.statStreak'),
      value: t('habitDetails.statDays', { value: stats.streak }),
    },
    {
      label: t('habitDetails.statTotal'),
      value: String(stats.totalCompleted),
    },
  ];

  return (
    <View style={styles.row}>
      {items.map(item => (
        <View key={item.label} style={styles.stat}>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {item.value}
          </Text>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
  },
  value: {
    ...text.button,
  },
  label: {
    ...text.caption,
    marginTop: spacing.xxs,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Touchable } from './Touchable';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';
import { radii } from '../theme/radii';
import { text } from '../theme/typography';

import type { HabitFilter } from '../types/habit';

type FilterOption = {
  value: HabitFilter;
  labelKey: 'filter.all' | 'filter.completed' | 'filter.pending';
};

const OPTIONS: FilterOption[] = [
  { value: 'all', labelKey: 'filter.all' },
  { value: 'completed', labelKey: 'filter.completed' },
  { value: 'pending', labelKey: 'filter.pending' },
];

type FilterTabsProps = {
  value: HabitFilter;
  onChange: (value: HabitFilter) => void;
  counts?: Partial<Record<HabitFilter, number>>;
};

export function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {OPTIONS.map(option => {
        const isActive = value === option.value;
        const count = counts?.[option.value];

        return (
          <Touchable
            key={option.value}
            accessibilityState={{ selected: isActive }}
            animateScale
            style={[
              styles.tab,
              {
                backgroundColor: isActive
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: isActive ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive
                    ? theme.colors.primaryText
                    : theme.colors.textMuted,
                },
              ]}
            >
              {t(option.labelKey)}
              {typeof count === 'number' ? ` · ${count}` : ''}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  tabText: {
    ...text.captionStrong,
  },
});
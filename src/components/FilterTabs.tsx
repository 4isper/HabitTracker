import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

import type { HabitFilter } from '../types/habit';

type FilterOption = {
  value: HabitFilter;
  label: string;
};

const OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'completed', label: 'Выполнено' },
  { value: 'pending', label: 'Не выполнено' },
];

type FilterTabsProps = {
  value: HabitFilter;
  onChange: (value: HabitFilter) => void;
  counts?: Partial<Record<HabitFilter, number>>;
};

export function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {OPTIONS.map(option => {
        const isActive = value === option.value;
        const count = counts?.[option.value];

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
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
              {option.label}
              {typeof count === 'number' ? ` · ${count}` : ''}
            </Text>
          </Pressable>
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
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import i18n from '../i18n';
import { Touchable } from './Touchable';
import { useTodayKey } from '../hooks/useTodayKey';
import {
  getMonthGrid,
  monthLabel,
  shiftMonth,
  weekdayLabels,
} from '../utils/calendar';
import {
  formatDateForDisplay,
  formatDateKey,
  isValidDateKey,
  parseDateKey,
} from '../utils/date';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';
import { radii } from '../theme/radii';
import { text } from '../theme/typography';

import type { CalendarCell } from '../utils/calendar';

type HabitCalendarProps = {
  completedDates: string[];
  createdAt: string;
  onToggleDate: (dateKey: string) => void;
};

/** How far back the grid is browsable when a habit has no history. */
const MAX_PAST_MONTHS = 24;

export function HabitCalendar({
  completedDates,
  createdAt,
  onToggleDate,
}: HabitCalendarProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const todayKey = useTodayKey();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const completed = useMemo(() => new Set(completedDates), [completedDates]);
  const locale = i18n.language;

  const createdDateKey = useMemo(
    () => formatDateKey(new Date(createdAt)),
    [createdAt],
  );

  const grid = useMemo(
    () =>
      getMonthGrid(visibleMonth, locale, completed, todayKey, createdDateKey),
    [visibleMonth, locale, completed, todayKey, createdDateKey],
  );

  const headings = useMemo(() => weekdayLabels(locale), [locale]);

  const earliestMonth = useMemo(() => {
    const floor = shiftMonth(new Date(), -MAX_PAST_MONTHS);
    const earliestKey = completedDates.filter(isValidDateKey).sort()[0];

    if (!earliestKey) {
      return floor;
    }

    const earliest = shiftMonth(parseDateKey(earliestKey), 0);

    return earliest < floor ? floor : earliest;
  }, [completedDates]);

  const canGoBack = shiftMonth(visibleMonth, -1) >= earliestMonth;
  const canGoForward = visibleMonth < shiftMonth(new Date(), 1);

  return (
    <View>
      <View style={styles.header}>
        <NavButton
          direction="previous"
          label={t('habitCalendar.previousMonth')}
          disabled={!canGoBack}
          onPress={() => setVisibleMonth(month => shiftMonth(month, -1))}
        />

        <Text style={[styles.monthLabel, { color: theme.colors.text }]}>
          {monthLabel(visibleMonth, locale)}
        </Text>

        <NavButton
          direction="next"
          label={t('habitCalendar.nextMonth')}
          disabled={!canGoForward}
          onPress={() => setVisibleMonth(month => shiftMonth(month, 1))}
        />
      </View>

      <View style={styles.week}>
        {headings.map((heading, index) => (
          <View key={`${heading}-${index}`} style={styles.cell}>
            <Text style={[styles.weekdayText, { color: theme.colors.textMuted }]}>
              {heading}
            </Text>
          </View>
        ))}
      </View>

      {grid.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.week}>
          {week.map((cell, dayIndex) => (
            <DayCell
              key={`${cell.dateKey ?? 'blank'}-${dayIndex}`}
              cell={cell}
              onToggleDate={onToggleDate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

type NavButtonProps = {
  direction: 'previous' | 'next';
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function NavButton({ direction, label, disabled, onPress }: NavButtonProps) {
  const theme = useAppTheme();

  return (
    <Touchable
      accessibilityLabel={label}
      disabled={disabled}
      style={[
        styles.navButton,
        {
          backgroundColor: disabled
            ? theme.colors.surfaceAlt
            : theme.colors.control,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.navText,
          { color: disabled ? theme.colors.textMuted : theme.colors.text },
        ]}
      >
        {direction === 'previous' ? '‹' : '›'}
      </Text>
    </Touchable>
  );
}

type DayCellProps = {
  cell: CalendarCell;
  onToggleDate: (dateKey: string) => void;
};

function DayCell({ cell, onToggleDate }: DayCellProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  if (!cell.dateKey) {
    return <View style={styles.cell} />;
  }

  const dateKey = cell.dateKey;
  const backgroundColor = cell.isCompleted
    ? theme.colors.success
    : cell.isToday
      ? theme.colors.surfaceAlt
      : theme.colors.surface;

  const circleStyle = {
    backgroundColor,
    borderColor: cell.isToday ? theme.colors.primary : 'transparent',
    opacity: cell.isFuture || cell.isBeforeCreation ? 0.3 : 1,
  };

  return (
    <Touchable
      disabled={cell.isFuture || cell.isBeforeCreation}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: cell.isCompleted }}
      accessibilityLabel={t('habitCalendar.dayA11y', {
        date: formatDateForDisplay(dateKey),
        status: t(
          cell.isCompleted
            ? 'habitCalendar.dayCompleted'
            : cell.isFuture
              ? 'habitCalendar.dayFuture'
              : 'habitCalendar.dayPending',
        ),
      })}
      style={styles.cell}
      onPress={() => onToggleDate(dateKey)}
    >
      <View
        style={[styles.dayCircle, circleStyle]}
      >
        <Text
          style={[
            styles.dayText,
            {
              color: cell.isCompleted
                ? theme.colors.primaryText
                : theme.colors.text,
            },
          ]}
        >
          {cell.day}
        </Text>
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 24,
    lineHeight: 28,
  },
  monthLabel: {
    ...text.buttonSm,
    textAlign: 'center',
  },
  week: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  weekdayText: {
    ...text.caption,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    ...text.captionStrong,
  },
});
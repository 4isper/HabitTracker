import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { uses24HourClock } from 'react-native-localize';

import { Touchable } from './Touchable';
import { EMOJI_OPTIONS, COLOR_OPTIONS } from '../constants/habitOptions';
import { controlPadding, spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';
import { radii } from '../theme/radii';
import { emojiSize, text } from '../theme/typography';
import {
  formatReminderTime,
  formatReminderTimeForDisplay,
  parseReminderTime,
} from '../utils/time';

import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type {
  CreateHabitInput,
  UpdateHabitError,
  UpdateHabitResult,
} from '../types/habit';

const ERROR_MESSAGE_KEYS = {
  empty: 'habitForm.errors.empty',
  duplicate: 'habitForm.errors.duplicate',
  notFound: 'habitForm.errors.notFound',
} as const satisfies Record<UpdateHabitError, string>;

type HabitFormProps = {
  initialValues?: {
    name: string;
    emoji?: string;
    color?: string;
    reminderTime?: string;
  };
  submitLabel: string;
  onSubmit: (input: CreateHabitInput) => UpdateHabitResult;
  onReminderRequested: () => Promise<boolean>;
  onCancel: () => void;
};

export function HabitForm({
  initialValues,
  submitLabel,
  onSubmit,
  onReminderRequested,
  onCancel,
}: HabitFormProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [emoji, setEmoji] = useState<string | undefined>(
    initialValues?.emoji
  );
const [color, setColor] = useState<string | undefined>(initialValues?.color);
  const [reminderTime, setReminderTime] = useState<string | undefined>(
    initialValues?.reminderTime,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const use24Hour = uses24HourClock();

  const pickerValue = (() => {
    const { hours, minutes } = parseReminderTime(reminderTime ?? '09:00');
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date;
  })();

  const handleSubmit = () => {
    const result = onSubmit({
      name,
      emoji,
      color,
      reminderTime,
    });

    if (!result.success) {
      setFormError(
        result.error
          ? t(ERROR_MESSAGE_KEYS[result.error])
          : t('habitForm.errors.unknown')
      );

      return;
    }

    setFormError(null);
  };

  const handleToggleReminder = () => {
    if (reminderTime) {
      setReminderTime(undefined);
      setPickerOpen(false);

      return;
    }

    onReminderRequested().then(granted => {
      if (granted) {
        setReminderTime('09:00');
        setPickerOpen(true);
      }
    });
  };

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setPickerOpen(false);
    }

    if (event.type === 'dismissed' || !selected) {
      return;
    }

    setReminderTime(
      formatReminderTime(selected.getHours(), selected.getMinutes()),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {t('habitForm.nameLabel')}
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          value={name}
          onChangeText={value => {
            setName(value);
            setFormError(null);
          }}
          placeholder={t('habitForm.namePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
        />

        {formError ? (
          <Text
            style={[
              styles.error,
              {
                color: theme.colors.danger,
              },
            ]}
          >
            {formError}
          </Text>
        ) : null}

        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {t('habitForm.emojiLabel')}
        </Text>

        <View style={styles.optionsRow}>
          {EMOJI_OPTIONS.map(option => {
            const isActive = emoji === option;

            return (
              <Touchable
                key={option}
                animateScale
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isActive }}
                style={[
                  styles.emojiOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  isActive && {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.surfaceAlt,
                  },
                ]}
                onPress={() =>
                  setEmoji(prevEmoji =>
                    prevEmoji === option ? undefined : option
                  )
                }
              >
                <Text style={styles.emojiText}>{option}</Text>
              </Touchable>
            );
          })}
        </View>

        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {t('habitForm.colorLabel')}
        </Text>

        <View style={styles.optionsRow}>
          {COLOR_OPTIONS.map(option => {
            const isActive = color === option;

            return (
              <Touchable
                key={option}
                animateScale
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isActive }}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: option,
                  },
                  isActive && {
                    borderColor: theme.colors.text,
                  },
                ]}
                onPress={() =>
                  setColor(prevColor =>
                    prevColor === option ? undefined : option
                  )
                }
              />
            );
          })}
        </View>

        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {t('habitForm.reminderLabel')}
        </Text>

        <View style={styles.reminderRow}>
          <Touchable
            animateScale
            accessibilityRole="switch"
            accessibilityState={{ checked: Boolean(reminderTime) }}
            accessibilityLabel={t('habitForm.reminderPick')}
            style={[
              styles.reminderToggle,
              {
                backgroundColor: reminderTime
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: reminderTime
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            onPress={handleToggleReminder}
          >
            <Text
              style={[
                styles.reminderToggleText,
                {
                  color: reminderTime
                    ? theme.colors.primaryText
                    : theme.colors.textMuted,
                },
              ]}
            >
              {reminderTime
                ? t('habitForm.reminderEnabled', {
                    time: formatReminderTimeForDisplay(reminderTime, use24Hour),
                  })
                : t('habitForm.reminderDisabled')}
            </Text>
          </Touchable>

          {reminderTime ? (
            <Touchable
              style={[styles.reminderEdit, { backgroundColor: theme.colors.control }]}
              onPress={() => setPickerOpen(true)}
            >
              <Text style={[styles.reminderEditText, { color: theme.colors.text }]}>
                {formatReminderTimeForDisplay(reminderTime, use24Hour)}
              </Text>
            </Touchable>
          ) : null}
        </View>

        {pickerOpen ? (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            display={use24Hour ? 'clock' : 'spinner'}
            is24Hour={use24Hour}
            onChange={handlePickerChange}
          />
        ) : null}

        <Touchable
          animateScale
          style={[
            styles.submitButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={handleSubmit}
        >
          <Text
            style={[
              styles.submitButtonText,
              {
                color: theme.colors.primaryText,
              },
            ]}
          >
            {submitLabel}
          </Text>
        </Touchable>

        <Touchable
          style={[
            styles.cancelButton,
            {
              backgroundColor: theme.colors.control,
            },
          ]}
          onPress={onCancel}
        >
          <Text
            style={[
              styles.cancelButtonText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {t('common.cancel')}
          </Text>
        </Touchable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.huge + spacing.xxl,
  },
  label: {
    ...text.label,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.md + spacing.xxs,
    paddingVertical: spacing.md,
    fontSize: text.bodyLg.fontSize,
    marginBottom: spacing.xl,
  },
  error: {
    marginBottom: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xxl,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: radii.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: controlPadding.chipGap,
    marginBottom: controlPadding.chipGap,
  },
  emojiText: {
    fontSize: emojiSize.sm,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  reminderToggle: {
    flex: 1,
    borderRadius: radii.control,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  reminderToggleText: {
    ...text.label,
  },
  reminderEdit: {
    borderRadius: radii.control,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  reminderEditText: {
    ...text.label,
  },
  submitButton: {
    borderRadius: radii.card,
    paddingVertical: controlPadding.button,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonText: {
    ...text.button,
  },
  cancelButton: {
    borderRadius: radii.card,
    paddingVertical: controlPadding.button,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...text.buttonSm,
  },
});
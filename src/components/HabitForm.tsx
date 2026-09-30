import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EMOJI_OPTIONS, COLOR_OPTIONS } from '../constants/habitOptions';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

import type { CreateHabitInput, UpdateHabitError, UpdateHabitResult } from '../types/habit';

const ERROR_MESSAGES: Record<UpdateHabitError, string> = {
  empty: 'Название привычки обязательно',
  duplicate: 'Привычка с таким названием уже есть',
  notFound: 'Привычка не найдена',
};

const FALLBACK_ERROR_MESSAGE = 'Не удалось сохранить привычку';

type HabitFormProps = {
  initialValues?: {
    name: string;
    emoji?: string;
    color?: string;
  };
  submitLabel: string;
  onSubmit: (input: CreateHabitInput) => UpdateHabitResult;
  onCancel: () => void;
};

export function HabitForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const theme = useAppTheme();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [emoji, setEmoji] = useState<string | undefined>(
    initialValues?.emoji
  );
  const [color, setColor] = useState<string | undefined>(
    initialValues?.color
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = onSubmit({
      name,
      emoji,
      color,
    });

    if (!result.success) {
      setFormError(
        result.error
          ? ERROR_MESSAGES[result.error]
          : FALLBACK_ERROR_MESSAGE
      );

      return;
    }

    setFormError(null);
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
      >
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          Название *
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
          placeholder="Например: пить воду"
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
          Иконка (необязательно)
        </Text>

        <View style={styles.optionsRow}>
          {EMOJI_OPTIONS.map(option => {
            const isActive = emoji === option;

            return (
              <Pressable
                key={option}
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
              </Pressable>
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
          Цвет (необязательно)
        </Text>

        <View style={styles.optionsRow}>
          {COLOR_OPTIONS.map(option => {
            const isActive = color === option;

            return (
              <Pressable
                key={option}
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

        <Pressable
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
        </Pressable>

        <Pressable
          style={[
            styles.cancelButton,
            {
              backgroundColor: theme.colors.surfaceAlt,
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
            Отмена
          </Text>
        </Pressable>
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    fontSize: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  emojiText: {
    fontSize: 22,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
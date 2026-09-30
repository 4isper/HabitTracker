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

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { useHabits } from '../state/HabitsContext';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

import type { RootStackParamList } from '../navigation/types';

const EMOJI_OPTIONS = ['🙂', '💪', '📚', '💧', '🏃', '🧘', '✍️', '🌿'];

const COLOR_OPTIONS = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#f59e0b',
  '#7c3aed',
  '#0ea5e9',
];

type AddHabitScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AddHabit'
>;

export function AddHabitScreen({ navigation }: AddHabitScreenProps) {
  const { addHabit } = useHabits();
  const theme = useAppTheme();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    const result = addHabit({
      name,
      emoji,
      color,
    });

    if (!result.success) {
      if (result.error === 'empty') {
        setFormError('Название привычки обязательно');
      } else if (result.error === 'duplicate') {
        setFormError('Привычка с таким названием уже есть');
      } else {
        setFormError('Не удалось добавить привычку');
      }

      return;
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <ScreenHeader
          title="Новая привычка"
          onBack={() => navigation.goBack()}
        />

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
            onChangeText={setName}
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
                      prevEmoji === option ? undefined : option,
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
                      prevColor === option ? undefined : option,
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
              Добавить
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.surfaceAlt,
              },
            ]}
            onPress={() => navigation.goBack()}
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
      </Screen>
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

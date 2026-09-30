import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { StyleProp, ViewStyle } from 'react-native';

import { CircleButton, CIRCLE_BUTTON_SIZE } from './CircleButton';
import { Icon } from './Icon';
import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({
  title,
  onBack,
  right,
  style,
}: ScreenHeaderProps) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>
        {onBack ? (
          <CircleButton
            accessibilityLabel={t('common.back')}
            onPress={onBack}
            style={{
              backgroundColor: theme.colors.surfaceAlt,
            }}
          >
            <Icon name="back" color={theme.colors.text} />
          </CircleButton>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.title,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {title}
      </Text>

      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: CIRCLE_BUTTON_SIZE,
  },
  side: {
    width: CIRCLE_BUTTON_SIZE,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
});

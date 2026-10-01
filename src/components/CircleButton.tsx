import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { StyleProp, ViewStyle } from 'react-native';

import { radii } from '../theme/radii';

export const CIRCLE_BUTTON_SIZE = 40;

const HIT_SLOP = 10;

type CircleButtonProps = {
  children: ReactNode;
  accessibilityLabel: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CircleButton({
  children,
  accessibilityLabel,
  onPress,
  style,
}: CircleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: CIRCLE_BUTTON_SIZE,
    height: CIRCLE_BUTTON_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});

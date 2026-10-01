import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import type { StyleProp, ViewStyle } from 'react-native';

import { Touchable } from './Touchable';
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
    <Touchable
      accessibilityLabel={accessibilityLabel}
      animateScale
      hitSlop={HIT_SLOP}
      style={[styles.button, style]}
      onPress={onPress}
    >
      {children}
    </Touchable>
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
});
import { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import type { ReactNode } from 'react';
import type { AccessibilityState, StyleProp, ViewStyle } from 'react-native';

import { motion } from '../theme/motion';

type TouchableProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  hitSlop?: number;
  disabled?: boolean;
  accessibilityRole?: 'button' | 'checkbox' | 'tab' | 'switch';
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  animateScale?: boolean;
};

export function Touchable({
  children,
  style,
  onPress,
  onPressIn,
  onPressOut,
  hitSlop,
  disabled,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
  animateScale = false,
}: TouchableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    onPressIn?.();

    if (!animateScale) {
      return;
    }

    Animated.timing(scale, {
      toValue: motion.pressed.scale,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [animateScale, onPressIn, scale]);

  const handlePressOut = useCallback(() => {
    onPressOut?.();

    if (!animateScale) {
      return;
    }

    Animated.spring(scale, {
      toValue: 1,
      ...motion.spring,
      useNativeDriver: true,
    }).start();
  }, [animateScale, onPressOut, scale]);

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        style,
        pressed && styles.pressed,
        animateScale ? { transform: [{ scale }] } : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: motion.pressed.opacity,
  },
});

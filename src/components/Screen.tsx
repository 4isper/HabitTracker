import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { StyleProp, ViewStyle } from 'react-native';

import { spacing } from '../theme/spacing';
import { useAppTheme } from '../theme/appTheme';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: ScreenProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
        { paddingHorizontal: spacing.xl },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

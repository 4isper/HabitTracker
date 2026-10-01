import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/appTheme';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const theme = useAppTheme();

  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.surfaceAlt,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: theme.colors.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  fill: {
    height: 8,
    borderRadius: radii.pill,
  },
});

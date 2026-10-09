import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import i18n from '../i18n';
import { resetHabits } from '../storage/habitsStorage';
import { Touchable } from './Touchable';
import { useAppTheme } from '../theme/appTheme';
import { radii } from '../theme/radii';
import { spacing } from '../theme/spacing';
import { text } from '../theme/typography';

import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

type ErrorFallbackProps = {
  onRetry: () => void;
  onReset: () => void;
};

function ErrorFallback({ onRetry, onReset }: ErrorFallbackProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + spacing.huge,
          paddingBottom: insets.bottom + spacing.huge,
          paddingHorizontal: spacing.xl,
        },
      ]}
    >
      <Text style={styles.emoji}>😵</Text>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {i18n.t('errorBoundary.title')}
      </Text>

      <Text style={[styles.description, { color: theme.colors.textMuted }]}>
        {i18n.t('errorBoundary.description')}
      </Text>

      <Touchable
        animateScale
        accessibilityLabel={i18n.t('errorBoundary.retry')}
        style={[styles.button, { backgroundColor: theme.colors.control }]}
        onPress={onRetry}
      >
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>
          {i18n.t('errorBoundary.retry')}
        </Text>
      </Touchable>

      <Touchable
        animateScale
        accessibilityLabel={i18n.t('errorBoundary.reset')}
        style={[styles.button, { backgroundColor: theme.colors.danger }]}
        onPress={onReset}
      >
        <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
          {i18n.t('errorBoundary.reset')}
        </Text>
      </Touchable>
    </View>
  );
}

/**
 * Must be mounted above `HabitsProvider`: state is read synchronously in a
 * lazy initializer during the first render, so an exception thrown there
 * cannot be caught by any boundary rendered inside the provider.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(i18n.t('errorBoundary.crashed'), error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleReset = () => {
    resetHabits();
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ErrorFallback onRetry={this.handleRetry} onReset={this.handleReset} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    ...text.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...text.bodySm,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    alignSelf: 'stretch',
    borderRadius: radii.control,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    ...text.button,
  },
});
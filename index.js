/**
 * @format
 */

import { AppRegistry } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import App from './App';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => () => (
  <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </SafeAreaProvider>
));

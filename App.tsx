import { StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import './src/i18n';

import { HabitsProvider } from './src/state/HabitsContext';

import { HomeScreen } from './src/screens/HomeScreen';
import { AddHabitScreen } from './src/screens/AddHabitScreen';
import { EditHabitScreen } from './src/screens/EditHabitScreen';
import { HabitDetailsScreen } from './src/screens/HabitDetailsScreen';

import { useAppTheme } from './src/theme/appTheme';

import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const navigationTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <HabitsProvider>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: t('nav.home'),
            }}
          />

          <Stack.Screen
            name="AddHabit"
            component={AddHabitScreen}
            options={{
              title: t('nav.addHabit'),
            }}
          />

          <Stack.Screen
            name="HabitDetails"
            component={HabitDetailsScreen}
            options={{
              title: t('nav.habitDetails'),
            }}
          />

          <Stack.Screen
            name="EditHabit"
            component={EditHabitScreen}
            options={{
              title: t('nav.editHabit'),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </HabitsProvider>
  );
}

export default App;

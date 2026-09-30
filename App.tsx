import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HabitsProvider } from './src/state/HabitsContext';

import { HomeScreen } from './src/screens/HomeScreen';
import { AddHabitScreen } from './src/screens/AddHabitScreen';
import { HabitDetailsScreen } from './src/screens/HabitDetailsScreen';

import { useAppTheme } from './src/theme/appTheme';

import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const theme = useAppTheme();

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
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Привычки',
            }}
          />

          <Stack.Screen
            name="AddHabit"
            component={AddHabitScreen}
            options={{
              title: 'Новая привычка',
            }}
          />

          <Stack.Screen
            name="HabitDetails"
            component={HabitDetailsScreen}
            options={{
              title: 'История привычки',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </HabitsProvider>
  );
}

export default App;
import { useColorScheme } from 'react-native';

export type AppTheme = {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    success: string;
    danger: string;
    completedBackground: string;
    inputBackground: string;
  };
};

const lightTheme: AppTheme = {
  dark: false,
  colors: {
    background: '#f9fafb',
    surface: '#ffffff',
    surfaceAlt: '#f3f4f6',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    primary: '#2563eb',
    primaryText: '#ffffff',
    success: '#16a34a',
    danger: '#dc2626',
    completedBackground: '#f0fdf4',
    inputBackground: '#ffffff',
  },
};

const darkTheme: AppTheme = {
  dark: true,
  colors: {
    background: '#020617',
    surface: '#0f172a',
    surfaceAlt: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e293b',
    primary: '#3b82f6',
    primaryText: '#ffffff',
    success: '#22c55e',
    danger: '#ef4444',
    completedBackground: '#052e16',
    inputBackground: '#0f172a',
  },
};

export function useAppTheme(): AppTheme {
  const colorScheme = useColorScheme();

  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
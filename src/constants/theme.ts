import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0C111C',
    textSecondary: '#5E6777',
    textMuted: '#94A0B4',
    background: '#F4F6FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF0FF',
    surface: '#FFFFFF',
    surfaceRaised: '#FBFCFF',
    border: '#E4E6EE',
    accent: '#6366F1',
    accentSoft: '#EEF0FF',
    accentText: '#FFFFFF',
    danger: '#EF4444',
    dangerSoft: '#FEECEC',
    success: '#10B981',
    shadow: 'rgba(15, 23, 42, 0.08)',
  },
  dark: {
    text: '#EEF0F6',
    textSecondary: '#8A93A7',
    textMuted: '#5E6679',
    background: '#0A0C13',
    backgroundElement: '#151823',
    backgroundSelected: '#242843',
    surface: '#151823',
    surfaceRaised: '#1E2230',
    border: '#262B3A',
    accent: '#818CF8',
    accentSoft: '#1E213B',
    accentText: '#0C111C',
    danger: '#F87171',
    dangerSoft: '#2B1618',
    success: '#34D399',
    shadow: 'rgba(0, 0, 0, 0.45)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

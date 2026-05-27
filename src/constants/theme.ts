import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#37352F',
    background: '#FFFFFF',
    backgroundElement: '#F7F6F3',
    backgroundSelected: '#EDECE9',
    textSecondary: '#787774',
    border: '#E9E9E7',
    accent: '#2383E2',
    accentMuted: '#E8F3FC',
    danger: '#EB5757',
    dangerMuted: '#FDEBEC',
    inputBackground: '#FFFFFF',
    placeholder: '#9B9A97',
  },
  dark: {
    text: '#FFFFFF',
    background: '#191919',
    backgroundElement: '#252525',
    backgroundSelected: '#2F2F2F',
    textSecondary: '#9B9A97',
    border: '#373737',
    accent: '#529EE0',
    accentMuted: '#1E2A36',
    danger: '#FF7369',
    dangerMuted: '#3D2624',
    inputBackground: '#252525',
    placeholder: '#6F6E69',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
    mono: 'monospace',
  },
  web: {
    sans: 'Inter, var(--font-display)',
    sansMedium: 'Inter, var(--font-display)',
    sansSemiBold: 'Inter, var(--font-display)',
    sansBold: 'Inter, var(--font-display)',
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
  six: 48,
} as const;

export const Radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
} as const;

export const MaxContentWidth = 420;

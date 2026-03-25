import '@/global.css';

import { Platform } from 'react-native';

const Brand = {
  primary: '#1A73E8',
  primaryLight: '#E8F0FE',
  primaryDark: '#1557B0',
  secondary: '#EA4335',
  accent: '#34A853',
  slate950: '#0F172A',
  slate900: '#111827',
  slate800: '#1F2937',
  slate700: '#374151',
  slate600: '#4B5563',
  slate500: '#6B7280',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  white: '#FFFFFF',
} as const;

export const Colors = {
  light: {
    text: '#202124',
    background: '#F8FAFC',
    backgroundElement: Brand.white,
    backgroundSelected: Brand.primaryLight,
    textSecondary: '#5F6368',
    primary: Brand.primary,
    primaryLight: Brand.primaryLight,
    primaryDark: Brand.primaryDark,
    secondary: Brand.secondary,
    accent: Brand.accent,
    card: Brand.white,
    border: Brand.slate200,
    muted: Brand.slate100,
  },
  dark: {
    text: '#F8FAFC',
    background: Brand.slate950,
    backgroundElement: Brand.slate900,
    backgroundSelected: Brand.slate800,
    textSecondary: '#94A3B8',
    primary: '#60A5FA',
    primaryLight: '#1E3A8A',
    primaryDark: '#93C5FD',
    secondary: '#F87171',
    accent: '#4ADE80',
    card: Brand.slate900,
    border: Brand.slate700,
    muted: Brand.slate800,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Avenir Next',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Elevation = {
  card: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  soft: {
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;

export const Layout = {
  maxContentWidth: 800,
  headerHeight: 56,
  tabBarInset: Platform.select({ ios: 50, android: 80, default: 64 }) ?? 64,
} as const;

export const BottomTabInset = Layout.tabBarInset;
export const MaxContentWidth = Layout.maxContentWidth;

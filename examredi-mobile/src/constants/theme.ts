import '@/global.css';

import { Platform } from 'react-native';

const Brand = {
  primary: '#3B82F6', // Modern vibrant blue
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  secondary: '#10B981', // Emerald green for success/accent
  accent: '#F59E0B',    // Amber for warnings/highlights
  // Neutral palette (Slate/Zinc hybrid)
  neutral950: '#020617',
  neutral900: '#0F172A',
  neutral800: '#1E293B',
  neutral700: '#334155',
  neutral600: '#475569',
  neutral500: '#64748B',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  neutral50: '#F8FAFC',
  white: '#FFFFFF',
} as const;

export const Colors = {
  light: {
    text: Brand.neutral900,
    background: Brand.neutral50,
    backgroundElement: Brand.white,
    backgroundSelected: Brand.primaryLight,
    textSecondary: Brand.neutral500,
    primary: Brand.primary,
    primaryLight: Brand.primaryLight,
    primaryDark: Brand.primaryDark,
    secondary: Brand.secondary,
    accent: Brand.accent,
    card: Brand.white,
    white: Brand.white,
    border: Brand.neutral200,
    muted: Brand.neutral100,
    error: '#EF4444',
  },
  dark: {
    text: Brand.neutral100,
    background: Brand.neutral950,
    backgroundElement: Brand.neutral900,
    backgroundSelected: Brand.neutral800,
    textSecondary: Brand.neutral400,
    primary: '#60A5FA',
    primaryLight: '#172554',
    primaryDark: '#93C5FD',
    secondary: '#34D399',
    accent: '#FBBF24',
    card: Brand.neutral900,
    white: Brand.white,
    border: Brand.neutral800,
    muted: Brand.neutral800,
    error: '#F87171',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    display: 'Outfit-Bold',
    sans: 'Inter-Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    display: 'sans-serif-medium',
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    display: 'var(--font-display)',
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  zero: 0,
  quarter: 2,
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
  eight: 96,
} as const;

export const Radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 999,
} as const;

export const Elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  card: {
    shadowColor: Brand.neutral950,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  soft: {
    shadowColor: Brand.neutral950,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  premium: {
    shadowColor: Brand.neutral950,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;

export const Layout = {
  maxContentWidth: 800,
  headerHeight: 56,
  tabBarInset: Platform.select({ ios: 50, android: 80, default: 64 }) ?? 64,
} as const;

export const BottomTabInset = Layout.tabBarInset;
export const MaxContentWidth = Layout.maxContentWidth;

import React from 'react';
import { StyleSheet, Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppTextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'caption' | 'label';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: keyof typeof Colors.light;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<TextStyle>;
}

export function AppText({
  variant = 'body',
  color = 'text',
  align = 'left',
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color: theme[color], textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts?.sans || 'sans-serif',
  },
  h1: {
    fontFamily: Fonts?.display || 'sans-serif-medium',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 40,
  },
  h2: {
    fontFamily: Fonts?.display || 'sans-serif-medium',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  h3: {
    fontFamily: Fonts?.display || 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
});

import React from 'react';
import { StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { Radius } from '@/constants/theme';

interface AppGlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: keyof typeof Radius;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function AppGlassView({
  children,
  intensity = 40,
  tint = 'default',
  borderRadius = 'lg',
  style,
  ...rest
}: AppGlassViewProps) {
  return (
    <GlassView
      intensity={intensity}
      tint={tint}
      style={[
        styles.base,
        { borderRadius: Radius[borderRadius] },
        style,
      ]}
      {...rest}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

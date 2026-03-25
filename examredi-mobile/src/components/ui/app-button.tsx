import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { AppText } from './app-text';
import { AppGlassView } from './app-glass-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'link';

interface AppButtonProps extends PressableProps {
  label: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  leftSlot,
  rightSlot,
  size = 'md',
  style,
  onPress,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const handlePress = (e: any) => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(e);
    }
  };

  const resolveVariantStyle = (state: PressableStateCallbackType) => {
    const isPressed = state.pressed && !isDisabled;
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isPressed ? theme.primaryDark : theme.primary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: isPressed ? theme.backgroundSelected : theme.primaryLight,
          borderColor: 'transparent',
        };
      case 'glass':
        return {
          backgroundColor: isPressed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.1)',
        };
      case 'outline':
        return {
          backgroundColor: isPressed ? theme.muted : 'transparent',
          borderColor: theme.border,
        };
      case 'ghost':
        return {
          backgroundColor: isPressed ? theme.muted : 'transparent',
          borderColor: 'transparent',
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          paddingHorizontal: 0,
          minHeight: 0,
        };
      default:
        return {};
    }
  };

  const getLabelColor = () => {
    if (variant === 'primary') return 'white' as keyof typeof Colors.light;
    if (variant === 'secondary' || variant === 'link') return 'primary';
    if (variant === 'glass') return 'white' as keyof typeof Colors.light;
    return 'text';
  };

  const resolveStyle = (state: PressableStateCallbackType) => {
    const incomingStyle = typeof style === 'function' ? style(state) : style;
    return [
      styles.base,
      styles[size],
      resolveVariantStyle(state),
      isDisabled && styles.disabled,
      incomingStyle,
    ];
  };

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={theme[getLabelColor()]} size="small" />
      ) : (
        <>
          {leftSlot}
          <AppText
            variant={size === 'sm' ? 'caption' : 'bodyBold'}
            color={getLabelColor()}
            style={variant === 'link' && styles.underline}
          >
            {label}
          </AppText>
          {rightSlot}
        </>
      )}
    </View>
  );

  if (variant === 'glass') {
    return (
      <AppGlassView borderRadius={size === 'sm' ? 'sm' : 'md'}>
        <Pressable
          disabled={isDisabled}
          style={resolveStyle}
          onPress={handlePress}
          {...rest}
        >
          {content}
        </Pressable>
      </AppGlassView>
    );
  }

  return (
    <Pressable
      disabled={isDisabled}
      style={resolveStyle}
      onPress={handlePress}
      {...rest}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.sm,
  },
  md: {
    minHeight: 48,
  },
  lg: {
    minHeight: 56,
    borderRadius: Radius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  disabled: {
    opacity: 0.5,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

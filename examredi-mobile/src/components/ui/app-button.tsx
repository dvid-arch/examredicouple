import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonVariant = 'primary' | 'secondary' | 'outline';

type AppButtonProps = PressableProps & {
  label: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  leftSlot?: React.ReactNode;
};

export function AppButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  leftSlot,
  style,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: theme.primary, borderColor: theme.primary }
      : variant === 'secondary'
        ? { backgroundColor: theme.accent, borderColor: theme.accent }
        : { backgroundColor: 'transparent', borderColor: theme.border };

  const labelColor = variant === 'outline' ? theme.text : '#FFFFFF';

  const resolveStyle = (state: PressableStateCallbackType) => {
    const incomingStyle = typeof style === 'function' ? style(state) : style;

    return [
      styles.base,
      variantStyle,
      isDisabled && styles.disabled,
      state.pressed && !isDisabled && styles.pressed,
      incomingStyle,
    ];
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={resolveStyle}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftSlot}
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radius.md,
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
});

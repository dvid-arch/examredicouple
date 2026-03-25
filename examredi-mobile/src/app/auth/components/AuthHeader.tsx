import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';
import { AuthMode } from '../hooks/useAuthForm';

interface AuthHeaderProps {
  mode: AuthMode;
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoMark}>
        <AppText variant="h1" color="primary" style={styles.logoLetter}>
          E
        </AppText>
      </View>
      <AppText variant="h2" align="center" style={styles.title}>
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        {mode === 'login'
          ? 'Sign in to continue your UTME journey'
          : 'Join thousands of students preparing smarter'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
    // Soft premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  logoLetter: {
    lineHeight: 40,
  },
  title: {
    marginBottom: Spacing.one,
  },
});

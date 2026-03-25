import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppInput, AppButton, AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuthForm } from '../hooks/useAuthForm';

export function AuthForm() {
  const {
    mode,
    fullName,
    email,
    password,
    errorMsg,
    isLoading,
    setFullName,
    setEmail,
    setPassword,
    switchMode,
    handleSubmit,
  } = useAuthForm();

  return (
    <View style={styles.container}>
      {mode === 'register' && (
        <AppInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      )}

      <AppInput
        label="Email Address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppInput
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {errorMsg ? (
        <AppText color="error" variant="caption" style={styles.error}>
          {errorMsg}
        </AppText>
      ) : null}

      <AppButton
        label={mode === 'login' ? 'Sign In' : 'Create Account'}
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submit}
      />

      <View style={styles.footer}>
        <AppText variant="body" color="textSecondary">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
        </AppText>
        <AppButton
          variant="link"
          label={mode === 'login' ? 'Sign Up' : 'Log In'}
          onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  error: {
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  submit: {
    marginTop: Spacing.two,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
});

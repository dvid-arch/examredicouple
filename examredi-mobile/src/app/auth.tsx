import React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

const BRAND_PRIMARY = '#1A73E8';
const BRAND_DARK = '#1355B5';
const BRAND_DEEPER = '#0D3F8F';
const ACCENT = '#34A853';
const ERROR_COLOR = '#D93025';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const { isAuthenticated, login, register, isLoading } = useAuth();

  const [mode, setMode] = React.useState<AuthMode>('login');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Entry animation
  const formSlide = React.useRef(new Animated.Value(40)).current;
  const formOpacity = React.useRef(new Animated.Value(0)).current;
  const heroOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(heroOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setErrorMsg('');
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const validate = (): string | null => {
    if (mode === 'register' && !fullName.trim())
      return 'Full name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    if (mode === 'register' && password.length < 6)
      return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });
      }
      router.replace('/dashboard');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEPER} />

      {/* Hero zone */}
      <Animated.View style={[styles.hero, { opacity: heroOpacity }]}>
        {/* Decorative circles */}
        <View style={[styles.heroCircle, styles.heroCircle1]} />
        <View style={[styles.heroCircle, styles.heroCircle2]} />

        <View style={styles.heroContent}>
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>E</Text>
          </View>
          <Text style={styles.heroTitle}>ExamRedi</Text>
          <Text style={styles.heroSub}>Your UTME success companion</Text>
        </View>
      </Animated.View>

      {/* Form zone */}
      <Animated.View
        style={[
          styles.formSheet,
          { opacity: formOpacity, transform: [{ translateY: formSlide }] },
        ]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formScrollContent}
        >
          {/* Mode toggle */}
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => switchMode('login')}
              style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'login' && styles.modeTabTextActive,
                ]}
              >
                Sign in
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode('register')}
              style={[
                styles.modeTab,
                mode === 'register' && styles.modeTabActive,
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  mode === 'register' && styles.modeTabTextActive,
                ]}
              >
                Create account
              </Text>
            </Pressable>
          </View>

          <Text style={styles.formHeading}>
            {mode === 'login' ? 'Welcome back' : 'Get started today'}
          </Text>
          <Text style={styles.formSub}>
            {mode === 'login'
              ? 'Sign in to continue your UTME preparation'
              : 'Join thousands of students preparing smarter'}
          </Text>

          {/* Fields */}
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor="#B0B8C5"
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  setErrorMsg('');
                }}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#B0B8C5"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrorMsg('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder={
                mode === 'register'
                  ? 'Minimum 6 characters'
                  : 'Enter your password'
              }
              placeholderTextColor="#B0B8C5"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrorMsg('');
              }}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Error message */}
          {errorMsg !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Submit button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              isLoading && styles.submitButtonLoading,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </Text>
          </Pressable>

          {/* Mode footer hint */}
          <View style={styles.footerHint}>
            <Text style={styles.footerHintText}>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
            </Text>
            <Pressable
              onPress={() =>
                switchMode(mode === 'login' ? 'register' : 'login')
              }
            >
              <Text style={styles.footerHintLink}>
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_DEEPER,
  },

  // Hero section
  hero: {
    flex: 0.38,
    backgroundColor: BRAND_DEEPER,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  heroCircle1: {
    width: 320,
    height: 320,
    top: -100,
    right: -80,
    backgroundColor: BRAND_PRIMARY,
    opacity: 0.22,
  },
  heroCircle2: {
    width: 200,
    height: 200,
    top: 10,
    left: -50,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroContent: {
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 4,
  },
  logoLetter: {
    fontSize: 30,
    fontWeight: '900',
    color: BRAND_PRIMARY,
    lineHeight: 34,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.65)',
  },

  // Form sheet
  formSheet: {
    flex: 0.62,
    backgroundColor: '#F7F9FC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  formScrollContent: {
    padding: 24,
    paddingBottom: 48,
    gap: 4,
  },

  // Mode toggle
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#EAECF2',
    borderRadius: 12,
    padding: 3,
    marginBottom: 18,
    gap: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A92A0',
  },
  modeTabTextActive: {
    color: BRAND_PRIMARY,
  },

  formHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D1B2E',
    marginBottom: 4,
  },
  formSub: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#6B7585',
    marginBottom: 16,
    lineHeight: 19,
  },

  // Fields
  fieldGroup: {
    gap: 5,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4A5568',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D0D7E3',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0D1B2E',
  },

  // Error
  errorBox: {
    backgroundColor: '#FEE8E6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FBBBB8',
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13.5,
    color: ERROR_COLOR,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Submit
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: BRAND_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: BRAND_DARK,
    shadowOpacity: 0.18,
  },
  submitButtonLoading: {
    opacity: 0.72,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Footer
  footerHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerHintText: {
    fontSize: 13.5,
    color: '#6B7585',
  },
  footerHintLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BRAND_PRIMARY,
    textDecorationLine: 'underline',
  },
});

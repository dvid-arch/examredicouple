import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppGlassView } from '@/components/ui/app-glass-view';
import { AuthHeader } from './components/AuthHeader';
import { AuthForm } from './components/AuthForm';
import { useAuthForm } from './hooks/useAuthForm';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Modular AuthScreen
 * Separates concerns into: 
 * - AuthHeader (Visual Brand)
 * - AuthForm (Interaction)
 * - useAuthForm (Business Logic)
 */
export default function AuthScreen() {
  const { mode } = useAuthForm();
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      
      <SafeAreaView style={styles.safe}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader mode={mode} />
          
          <AppGlassView intensity={20} borderRadius="xl" style={styles.glassContainer}>
            <View style={styles.formPadding}>
              <AuthForm />
            </View>
          </AppGlassView>
          
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.six,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.eight,
    justifyContent: 'center',
  },
  glassContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  formPadding: {
    padding: Spacing.six,
  },
});

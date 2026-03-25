import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen, AppCard, AppText, AppButton } from '@/components/ui';
import { AuthRequired } from '@/components/auth/auth-required';
import { Spacing } from '@/constants/theme';

import { usePracticeSession } from './hooks/usePracticeSession';
import { PracticeHeader } from './components/PracticeHeader';
import { PracticeSetup } from './components/PracticeSetup';
import { PracticeSessionRunner } from '@/components/practice/practice-session-runner';

export default function PracticeScreen() {
  const { state, startSession, completeSession, reset } = usePracticeSession();

  return (
    <AppScreen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PracticeHeader />

        <AuthRequired
          title="Sign in to use Practice"
          description="Practice setup and saved preferences are tied to your account session."
        >
          {state.kind === 'ready' ? (
            <PracticeSessionRunner 
              session={state.session}
              onReset={reset}
              onComplete={completeSession}
            />
          ) : (
            <View style={styles.stack}>
              <PracticeSetup onApply={startSession} isApplying={state.kind === 'loading'} />

              {state.kind === 'empty' && (
                <AppCard style={styles.statusCard}>
                  <AppText variant="bodyBold">No questions found</AppText>
                  <AppText variant="caption" color="textSecondary">{state.message}</AppText>
                </AppCard>
              )}

              {state.kind === 'error' && (
                <AppCard style={styles.statusCard}>
                  <AppText variant="bodyBold" color="error">Could not start session</AppText>
                  <AppText variant="caption" color="textSecondary">{state.message}</AppText>
                  <AppButton label="Try again" variant="outline" onPress={reset} />
                </AppCard>
              )}
            </View>
          )}
        </AuthRequired>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  stack: {
    gap: Spacing.four,
  },
  statusCard: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth/auth-required';
import { PracticeSessionRunner } from '@/components/practice/practice-session-runner';
import { PracticeSetupPanel } from '@/components/practice/practice-setup-panel';
import { ThemedView } from '@/components/themed-view';
import { AppButton, AppCard, AppScreen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { performanceService } from '@/services/performance-service';
import { practiceService } from '@/services/practice-service';
import { ThemedText } from '@/components/themed-text';
import {
  PracticeSessionCompletion,
  PracticeSetupDraft,
  PreparedPracticeSession,
} from '@/types/practice';

type PracticeState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; session: PreparedPracticeSession }
  | { kind: 'empty'; message: string }
  | { kind: 'error'; message: string };

export default function PracticeScreen() {
  const [state, setState] = React.useState<PracticeState>({ kind: 'idle' });

  const handleSessionComplete = React.useCallback(
    async (payload: PracticeSessionCompletion) => {
      await performanceService.savePracticeResult(payload);
    },
    [],
  );

  const startSession = React.useCallback(async (draft: PracticeSetupDraft) => {
    setState({ kind: 'loading' });

    try {
      const papers = await practiceService.fetchPapers();
      const session = practiceService.buildSession(draft, papers);

      if (session.questions.length === 0) {
        setState({
          kind: 'empty',
          message:
            'No questions matched this setup. Expand your year range or change selected subjects.',
        });
        return;
      }

      setState({ kind: 'ready', session });
    } catch (error) {
      setState({
        kind: 'error',
        message:
          (error as Error).message ||
          'Unable to prepare your session right now. Please try again.',
      });
    }
  }, []);

  return (
    <AppScreen>
      <ThemedText type="subtitle">Practice</ThemedText>
      <ThemedText style={styles.pageCaption} themeColor="textSecondary">
        Build a focused UTME session in seconds with saved setup and instant
        question preparation.
      </ThemedText>

      <AuthRequired
        title="Sign in to use Practice"
        description="Practice setup and saved preferences are tied to your account session."
      >
        {state.kind === 'ready' ? (
          <PracticeSessionRunner
            session={state.session}
            onReset={() => setState({ kind: 'idle' })}
            onComplete={handleSessionComplete}
          />
        ) : (
          <View style={styles.stack}>
            <PracticeSetupPanel
              isApplying={state.kind === 'loading'}
              onApply={startSession}
            />

            {state.kind === 'loading' ? (
              <AppCard>
                <ThemedText type="smallBold">
                  Preparing your session...
                </ThemedText>
                <ThemedText
                  style={styles.statusBody}
                  themeColor="textSecondary"
                >
                  Fetching papers and assembling balanced questions for your
                  selected setup.
                </ThemedText>
              </AppCard>
            ) : null}

            {state.kind === 'empty' ? (
              <ThemedView type="backgroundElement" style={styles.statusCard}>
                <ThemedText type="smallBold">No questions found</ThemedText>
                <ThemedText
                  style={styles.statusBody}
                  themeColor="textSecondary"
                >
                  {state.message}
                </ThemedText>
              </ThemedView>
            ) : null}

            {state.kind === 'error' ? (
              <ThemedView type="backgroundElement" style={styles.statusCard}>
                <ThemedText type="smallBold">
                  Could not start session
                </ThemedText>
                <ThemedText
                  style={styles.statusBody}
                  themeColor="textSecondary"
                >
                  {state.message}
                </ThemedText>
                <AppButton
                  label="Try again"
                  variant="outline"
                  onPress={() => setState({ kind: 'idle' })}
                />
              </ThemedView>
            ) : null}
          </View>
        )}
      </AuthRequired>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pageCaption: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  stack: {
    gap: Spacing.two,
  },
  statusCard: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  statusBody: {
    marginTop: Spacing.one,
    lineHeight: 20,
  },
});

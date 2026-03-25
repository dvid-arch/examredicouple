import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen, AppCard, AppButton, AppText } from '@/components/ui';
import { AuthRequired } from '@/components/auth/auth-required';
import { Spacing } from '@/constants/theme';

import { usePerformanceData } from './hooks/usePerformanceData';
import { PerformanceHeader } from './components/PerformanceHeader';
import { PerformanceStats } from './components/PerformanceStats';
import { SessionHistory } from './components/SessionHistory';
import { PerformanceInsights } from './components/PerformanceInsights';

export default function PerformanceScreen() {
  const { state, refresh } = usePerformanceData();

  return (
    <AppScreen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PerformanceHeader />

        <AuthRequired
          title="Sign in to view Performance"
          description="Performance analytics are personal and require an active account session."
        >
          {state.kind === 'loading' && (
            <AppCard style={styles.stateCard}>
              <AppText variant="bodyBold">Loading your analytics...</AppText>
              <AppText variant="caption" color="textSecondary">Pulling your latest session data.</AppText>
            </AppCard>
          )}

          {state.kind === 'empty' && (
            <AppCard style={styles.stateCard}>
              <AppText variant="bodyBold">🎯 No sessions yet</AppText>
              <AppText variant="caption" color="textSecondary">
                Complete your first practice session to start tracking your performance.
              </AppText>
            </AppCard>
          )}

          {state.kind === 'locked' && (
            <AppCard style={styles.stateCard}>
              <AppText variant="bodyBold">📊 Performance is a Pro feature</AppText>
              <AppText variant="caption" color="textSecondary">
                Upgrade to Pro to unlock detailed progress analytics.
              </AppText>
              <AppButton label="View Plans" variant="primary" style={styles.action} />
            </AppCard>
          )}

          {state.kind === 'error' && (
            <AppCard style={styles.stateCard}>
              <AppText variant="bodyBold" color="error">⚠️ Could not load analytics</AppText>
              <AppText variant="caption" color="textSecondary">{state.message}</AppText>
              <AppButton label="Try again" variant="outline" onPress={refresh} style={styles.action} />
            </AppCard>
          )}

          {state.kind === 'ready' && (
            <View style={styles.readyStack}>
              <PerformanceStats 
                attempts={state.summary.attempts} 
                average={state.summary.average} 
                best={state.summary.best} 
              />
              <PerformanceInsights 
                streak={state.streak} 
                trend={state.trend} 
                latestScore={Math.round((state.results[0].score / state.results[0].totalQuestions) * 100)} 
              />
              <SessionHistory results={state.results} onRefresh={refresh} />
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
  stateCard: {
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  action: {
    marginTop: Spacing.two,
    width: '100%',
  },
  readyStack: {
    gap: Spacing.two,
  },
});

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { AuthRequired } from '@/components/auth/auth-required';
import { ThemedView } from '@/components/themed-view';
import { AppButton, AppCard, AppScreen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { performanceService } from '@/services/performance-service';
import { ThemedText } from '@/components/themed-text';
import { PerformanceResult } from '@/types/practice';
import { useTheme } from '@/hooks/use-theme';

type PerformanceState =
  | { kind: 'loading' }
  | { kind: 'ready'; results: PerformanceResult[] }
  | { kind: 'empty' }
  | { kind: 'locked'; message: string }
  | { kind: 'error'; message: string };

export default function PerformanceScreen() {
  const [state, setState] = React.useState<PerformanceState>({
    kind: 'loading',
  });

  const loadPerformance = React.useCallback(async () => {
    setState({ kind: 'loading' });

    try {
      const results = await performanceService.getPerformanceResults();

      if (results.length === 0) {
        setState({ kind: 'empty' });
        return;
      }

      setState({ kind: 'ready', results });
    } catch (error) {
      const message =
        (error as Error).message ||
        'Could not load performance right now. Please try again.';

      if (message.toLowerCase().includes('pro feature')) {
        setState({ kind: 'locked', message });
        return;
      }

      setState({
        kind: 'error',
        message,
      });
    }
  }, []);

  React.useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="subtitle">Performance Analytics</ThemedText>
        <ThemedText style={styles.pageCaption} themeColor="textSecondary">
          Track your progress and identify areas for improvement.
        </ThemedText>

        <AuthRequired
          title="Sign in to view Performance"
          description="Performance analytics are personal and require an active account session."
        >
          {state.kind === 'loading' ? (
            <AppCard>
              <ThemedText type="smallBold">
                Loading your analytics...
              </ThemedText>
              <ThemedText style={styles.bodyText} themeColor="textSecondary">
                Pulling your latest session data.
              </ThemedText>
            </AppCard>
          ) : null}

          {state.kind === 'empty' ? (
            <AppCard>
              <ThemedText type="smallBold">🎯 No sessions yet</ThemedText>
              <ThemedText style={styles.bodyText} themeColor="textSecondary">
                Complete your first practice session to start tracking your
                performance.
              </ThemedText>
            </AppCard>
          ) : null}

          {state.kind === 'locked' ? (
            <AppCard>
              <ThemedText type="smallBold">
                📊 Performance is a Pro feature
              </ThemedText>
              <ThemedText style={styles.bodyText} themeColor="textSecondary">
                Upgrade to Pro to unlock detailed progress analytics.
              </ThemedText>
            </AppCard>
          ) : null}

          {state.kind === 'error' ? (
            <AppCard>
              <ThemedText type="smallBold">
                ⚠️ Could not load analytics
              </ThemedText>
              <ThemedText style={styles.bodyText} themeColor="textSecondary">
                {state.message}
              </ThemedText>
              <AppButton
                label="Try again"
                variant="outline"
                onPress={loadPerformance}
              />
            </AppCard>
          ) : null}

          {state.kind === 'ready' ? (
            <PerformanceBody
              results={state.results}
              onRefresh={loadPerformance}
            />
          ) : null}
        </AuthRequired>
      </ScrollView>
    </AppScreen>
  );
}

function PerformanceBody({
  results,
  onRefresh,
}: {
  results: PerformanceResult[];
  onRefresh: () => void;
}) {
  const theme = useTheme();
  const summary = performanceService.buildSummary(results);

  return (
    <View style={styles.stack}>
      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <StatCard
          label="Total Attempts"
          value={String(summary.attempts)}
          icon="📝"
          color={theme.primary}
        />
        <StatCard
          label="Average Score"
          value={`${Math.round(summary.average)}%`}
          icon="📊"
          color={theme.accent}
        />
        <StatCard
          label="Best Score"
          value={`${Math.round(summary.best)}%`}
          icon="🏆"
          color={theme.secondary}
        />
      </View>

      {/* Recent Sessions */}
      <View style={styles.section}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          📈 Recent Sessions
        </ThemedText>
        <AppCard>
          <View style={styles.historyList}>
            {results.slice(0, 10).map((result, index) => {
              const percentage =
                result.totalQuestions > 0
                  ? Math.round((result.score / result.totalQuestions) * 100)
                  : 0;

              const statusColor =
                percentage >= 70
                  ? theme.accent
                  : percentage >= 50
                    ? theme.secondary
                    : '#EF4444';

              return (
                <View
                  key={result._id}
                  style={[
                    styles.historyItem,
                    index !== results.slice(0, 10).length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.historyLeft}>
                    <ThemedText type="smallBold">{result.subject}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {new Date(result.date).toLocaleDateString()} ·{' '}
                      {result.type.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View
                    style={[styles.scoreBox, { borderLeftColor: statusColor }]}
                  >
                    <ThemedText type="smallBold">{percentage}%</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {result.score}/{result.totalQuestions}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.refreshWrap}>
            <AppButton
              label="Refresh Data"
              variant="outline"
              onPress={onRefresh}
            />
          </View>
        </AppCard>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          💡 Insights
        </ThemedText>
        <InsightCard
          emoji="🎯"
          title="Latest Score"
          value={`${Math.round((results[0].score / results[0].totalQuestions) * 100)}%`}
          subtitle="Just completed"
        />
        <InsightCard
          emoji="📅"
          title="Streak"
          value={calculateStreak(results).toString()}
          subtitle="Days in a row"
        />
        <InsightCard
          emoji="⬆️"
          title="Trend"
          value={getTrendIndicator(results)}
          subtitle="Recent performance"
        />
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={[styles.statIcon, { color }]}>{icon}</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function InsightCard({
  emoji,
  title,
  value,
  subtitle,
}: {
  emoji: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <AppCard style={styles.insightCard}>
      <View style={styles.insightContent}>
        <ThemedText style={styles.insightEmoji}>{emoji}</ThemedText>
        <View style={styles.insightText}>
          <ThemedText type="caption" themeColor="textSecondary">
            {title}
          </ThemedText>
          <ThemedText type="smallBold">{value}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>
      </View>
    </AppCard>
  );
}

function calculateStreak(results: PerformanceResult[]): number {
  if (results.length === 0) return 0;

  let streak = 1;
  const dates = results.map((r) => new Date(r.date).toDateString());

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.floor(
      (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getTrendIndicator(results: PerformanceResult[]): string {
  if (results.length < 2) return '—';

  const recent = results.slice(0, Math.min(5, results.length));
  const avgRecent =
    recent.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
    recent.length;

  const older = results.slice(Math.min(5, results.length), 10);
  if (older.length === 0) return '→';

  const avgOlder =
    older.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
    older.length;

  const diff = avgRecent - avgOlder;
  if (diff > 5) return '📈 Improving';
  if (diff < -5) return '📉 Declining';
  return '→ Steady';
}

const styles = StyleSheet.create({
  pageCaption: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  stack: {
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: Spacing.one,
  },
  statValue: {
    marginTop: Spacing.one,
  },
  historyList: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: 0,
    gap: Spacing.two,
  },
  historyLeft: {
    flex: 1,
    gap: Spacing.half,
  },
  scoreBox: {
    alignItems: 'flex-end',
    paddingLeft: Spacing.two,
    borderLeftWidth: 3,
    paddingVertical: Spacing.one,
  },
  refreshWrap: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  insightCard: {
    marginBottom: Spacing.two,
  },
  insightContent: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  insightEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    gap: Spacing.half,
  },
});

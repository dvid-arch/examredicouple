import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton, AppCard, AppScreen } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';
import {
  learningService,
  RevisionQueueItem,
  WeakTopicInsight,
} from '@/services/learning-service';
import { performanceService } from '@/services/performance-service';
import { practiceSetupStorage } from '@/services/practice-setup-storage';
import { PerformanceResult } from '@/types/practice';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceResult[]>(
    [],
  );
  const [stats, setStats] = useState({ attempts: 0, average: 0, best: 0 });
  const [weakTopics, setWeakTopics] = useState<WeakTopicInsight[]>([]);
  const [revisionQueue, setRevisionQueue] = useState<RevisionQueueItem[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPerformanceData();
    }
  }, [isAuthenticated]);

  const loadPerformanceData = async () => {
    try {
      const results = await performanceService.getPerformanceResults();
      setPerformanceData(results);
      const summary = performanceService.buildSummary(results);
      setStats(summary);
      setWeakTopics(learningService.buildWeakTopicInsights(results));
      setRevisionQueue(learningService.buildRevisionQueue(results));
    } catch {
      // Gracefully handle errors (Pro-lock, network, etc.)
    }
  };

  const startDrillForSubject = async (subject: string) => {
    const draft = learningService.buildSubjectDrillDraft(subject);
    await practiceSetupStorage.saveDraft(draft);
    router.push('/practice');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.fullName?.split(' ')[0] || 'Scholar';
  const recentSession = performanceData[0];

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="caption" style={styles.greeting}>
              {getGreeting()}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.userName}>
              {userName}
            </ThemedText>
          </View>
        </View>

        {/* Stats Cards */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            <StatCard
              label="Sessions"
              value={stats.attempts.toString()}
              color={theme.primary}
            />
            <StatCard
              label="Average"
              value={`${Math.round(stats.average)}%`}
              color={theme.accent}
            />
            <StatCard
              label="Best"
              value={`${Math.round(stats.best)}%`}
              color={theme.secondary}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionGrid}>
            <ActionButton
              label="Start Practice"
              icon="📝"
              onPress={() => router.push('/practice')}
              color={theme.primary}
            />
            <ActionButton
              label="View Analytics"
              icon="📊"
              onPress={() => router.push('/performance')}
              color={theme.accent}
            />
          </View>
        </View>

        {/* Recent Session */}
        {isAuthenticated && recentSession && (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Last Session
            </ThemedText>
            <AppCard>
              <View style={styles.recentSessionContent}>
                <View style={styles.recentSessionInfo}>
                  <ThemedText type="smallBold">
                    {recentSession.subject}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    themeColor="textSecondary"
                    style={styles.recentDate}
                  >
                    {new Date(recentSession.date).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.scoreCircle,
                    {
                      backgroundColor:
                        recentSession.score >= 70
                          ? theme.accent
                          : recentSession.score >= 50
                            ? theme.secondary
                            : '#EF4444',
                    },
                  ]}
                >
                  <ThemedText type="smallBold" style={styles.scoreText}>
                    {recentSession.score}%
                  </ThemedText>
                </View>
              </View>
            </AppCard>
          </View>
        )}

        {isAuthenticated && weakTopics.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Unit 6: Weak-Topic Drills
            </ThemedText>
            {weakTopics.map((topic) => (
              <AppCard key={topic.subject} style={styles.drillCard}>
                <View style={styles.drillHeader}>
                  <View style={styles.drillInfo}>
                    <ThemedText type="smallBold">{topic.subject}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {topic.accuracy}% accuracy across {topic.totalQuestions}{' '}
                      questions
                    </ThemedText>
                  </View>
                  <AppButton
                    label="Start Drill"
                    variant="outline"
                    onPress={() => {
                      void startDrillForSubject(topic.subject);
                    }}
                  />
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}

        {isAuthenticated && revisionQueue.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Unit 6: Revision Queue
            </ThemedText>
            {revisionQueue.map((item) => (
              <AppCard key={item.id} style={styles.revisionCard}>
                <View style={styles.revisionHeader}>
                  <View style={styles.revisionInfo}>
                    <ThemedText type="smallBold">{item.subject}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {item.mistakes} mistakes • Last score {item.scorePercent}%
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => {
                      void startDrillForSubject(item.subject);
                    }}
                    style={styles.revisionLinkPressable}
                  >
                    <ThemedText
                      style={[styles.revisionLink, { color: theme.primary }]}
                    >
                      Review
                    </ThemedText>
                  </Pressable>
                </View>
              </AppCard>
            ))}
          </View>
        ) : null}

        {/* Getting Started */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <AppCard>
              <ThemedText type="smallBold" style={styles.cardTitle}>
                Welcome to ExamRedi
              </ThemedText>
              <ThemedText
                style={styles.cardDescription}
                themeColor="textSecondary"
              >
                Sign in to track your progress, sync practice sessions, and
                unlock personalised UTME preparation.
              </ThemedText>
              <AppButton
                label="Sign in"
                onPress={() => router.push('/auth')}
                style={styles.signInButton}
              />
            </AppCard>
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Quick Tips
          </ThemedText>
          <TipCard
            icon="💡"
            title="Consistent Practice"
            description="Practice regularly to improve retention and speed"
          />
          <TipCard
            icon="⏱️"
            title="Timed Practice"
            description="Use mock exams to simulate real test conditions"
          />
          <TipCard
            icon="📈"
            title="Track Progress"
            description="Monitor your performance trends to identify weak areas"
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="subtitle" style={{ fontSize: 24 }}>
        {value}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  color,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionButtonPress}>
      {({ pressed }) => (
        <View style={[styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}>
          <View style={[styles.actionIcon, { backgroundColor: color }]}>
            <ThemedText style={styles.iconEmoji}>{icon}</ThemedText>
          </View>
          <ThemedText type="caption" style={styles.actionLabel}>
            {label}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function TipCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <AppCard style={styles.tipCard}>
      <View style={styles.tipContent}>
        <ThemedText style={styles.tipIcon}>{icon}</ThemedText>
        <View style={styles.tipText}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {description}
          </ThemedText>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  greeting: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    marginTop: Spacing.half,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderLeftWidth: 4,
    borderRadius: Radius.md,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButtonPress: {
    flex: 1,
  },
  actionButton: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    textAlign: 'center',
    maxWidth: 80,
  },
  recentSessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentSessionInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  recentDate: {
    marginTop: Spacing.one,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  cardTitle: {
    marginBottom: Spacing.two,
  },
  cardDescription: {
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  signInButton: {
    marginTop: Spacing.two,
  },
  tipCard: {
    marginBottom: Spacing.two,
  },
  drillCard: {
    marginBottom: Spacing.two,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  drillInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  revisionCard: {
    marginBottom: Spacing.two,
  },
  revisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  revisionInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  revisionLinkPressable: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.half,
  },
  revisionLink: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tipContent: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    gap: Spacing.one,
  },
});

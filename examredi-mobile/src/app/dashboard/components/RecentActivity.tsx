import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard, AppText, AppButton, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { learningService } from '@/services/learning-service';
import { practiceSetupStorage } from '@/services/practice-setup-storage';
import { useRouter } from 'expo-router';
import { PerformanceResult } from '@/types/practice';
import { WeakTopicInsight, RevisionQueueItem } from '@/services/learning-service';

interface RecentActivityProps {
  recentSessions: PerformanceResult[];
  weakTopics: WeakTopicInsight[];
  revisionQueue: RevisionQueueItem[];
}

export function RecentActivity({ recentSessions, weakTopics, revisionQueue }: RecentActivityProps) {
  const theme = useTheme();
  const router = useRouter();

  const startDrill = async (subject: string) => {
    const draft = learningService.buildSubjectDrillDraft(subject);
    await practiceSetupStorage.saveDraft(draft);
    router.push('/practice');
  };

  return (
    <View style={styles.container}>
      {/* 1. Continue Studying (Horizontal Scroller) */}
      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Continue Studying</AppText>
            <AppText variant="caption" color="primary">View All</AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {recentSessions.slice(0, 4).map((session, index) => (
              <AppGlassView key={session.id || index} intensity={15} style={styles.sessionCard}>
                <View style={[styles.typeIcon, { backgroundColor: theme.primary + '20' }]}>
                  <AppText variant="bodyBold">📝</AppText>
                </View>
                <View style={styles.sessionInfo}>
                  <AppText variant="bodyBold" numberOfLines={1}>{session.subject}</AppText>
                  <AppText variant="caption" color="textSecondary">{session.score}% • {new Date(session.date).toLocaleDateString()}</AppText>
                </View>
                <AppButton 
                  label="Resume" 
                  variant="ghost" 
                  size="sm" 
                  onPress={() => router.push('/practice')} 
                />
              </AppGlassView>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 2. Focus Areas (Weaknesses) */}
      {weakTopics.length > 0 && (
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>Focus Areas</AppText>
          <AppGlassView intensity={5} style={styles.focusCard}>
            <View style={styles.focusHeader}>
              <View style={styles.warningIcon}>
                <AppText>⚠️</AppText>
              </View>
              <AppText variant="caption" color="textSecondary">
                Based on your results, we recommend these drills:
              </AppText>
            </View>
            <View style={styles.weakGrid}>
              {weakTopics.slice(0, 3).map((topic) => (
                <Pressable key={topic.subject} onPress={() => startDrill(topic.subject)} style={styles.weakItem}>
                  <AppText variant="bodyBold">{topic.subject}</AppText>
                  <AppText variant="caption" color="textSecondary">{topic.accuracy}% accuracy</AppText>
                  <View style={styles.statusBar}>
                    <View style={[styles.statusFill, { width: `${topic.accuracy}%`, backgroundColor: topic.accuracy < 50 ? '#EF4444' : '#F59E0B' }]} />
                  </View>
                </Pressable>
              ))}
            </View>
          </AppGlassView>
        </View>
      )}

      {/* 3. Personalized Tool Recommendation */}
      <View style={styles.section}>
        <AppText variant="h3" style={styles.sectionTitle}>Daily Recommendations</AppText>
        <Pressable onPress={() => router.push('/explore/flashcards' as any)}>
          <AppGlassView intensity={20} style={styles.toolRecommendation}>
            <View style={styles.toolIcon}>
              <AppText variant="h2">🎴</AppText>
            </View>
            <View style={styles.toolText}>
              <AppText variant="bodyBold">Try Flashcards</AppText>
              <AppText variant="caption" color="textSecondary">Active recall for {weakTopics[0]?.subject || 'Biology'}</AppText>
            </View>
            <AppText variant="bodyBold" color="primary">→</AppText>
          </AppGlassView>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.six,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  horizontalScroll: {
    paddingVertical: Spacing.two,
  },
  sessionCard: {
    width: 280,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.xl,
    marginRight: Spacing.four,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  focusCard: {
    padding: Spacing.four,
    borderRadius: Radius.xl,
    gap: Spacing.four,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  warningIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weakGrid: {
    gap: Spacing.four,
  },
  weakItem: {
    gap: Spacing.two,
  },
  statusBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  statusFill: {
    height: '100%',
  },
  toolRecommendation: {
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  toolText: {
    flex: 1,
  },
});
import { ScrollView, Pressable } from 'react-native';

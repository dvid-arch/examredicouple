import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen, AppCard, AppButton, AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';

import { useDashboardData } from './hooks/useDashboardData';
import { DashboardHeader } from './components/DashboardHeader';
import { StatGrid } from './components/StatGrid';
import { QuickActions } from './components/QuickActions';
import { RecentActivity } from './components/RecentActivity';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    userName,
    getGreeting,
    isAuthenticated,
    stats,
    recentSession,
    weakTopics,
    revisionQueue,
    loading,
  } = useDashboardData();

  if (loading) return <AppScreen loading />;

  return (
    <AppScreen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardHeader userName={userName} greeting={getGreeting()} />

        {isAuthenticated ? (
          <>
            <StatGrid {...stats} />
            <QuickActions />
            <RecentActivity 
              recentSessions={performanceData}
              weakTopics={weakTopics}
              revisionQueue={revisionQueue}
            />
          </>
        ) : (
          <View style={styles.guestContainer}>
            <AppCard style={styles.guestCard}>
              <AppText variant="h3" style={styles.guestTitle}>
                Ready to excel?
              </AppText>
              <AppText color="textSecondary" style={styles.guestDesc}>
                Sign in to track your progress, sync sessions, and unlock personalized UTME preparation.
              </AppText>
              <AppButton 
                label="Get Started" 
                onPress={() => router.push('/auth')} 
                style={styles.guestButton}
              />
            </AppCard>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <AppText variant="label" color="textSecondary" style={styles.sectionTitle}>
            Pro Tips
          </AppText>
          <TipItem icon="💡" text="Practice regularly to improve retention and speed." />
          <TipItem icon="⏱️" text="Use timed mock exams to simulate real test conditions." />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function TipItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tipItem}>
      <AppText variant="body" style={styles.tipIcon}>{icon}</AppText>
      <AppText variant="caption" color="textSecondary" style={styles.tipText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  guestContainer: {
    marginTop: Spacing.two,
  },
  guestCard: {
    padding: Spacing.six,
    alignItems: 'center',
    textAlign: 'center',
  },
  guestTitle: {
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  guestDesc: {
    marginBottom: Spacing.five,
    textAlign: 'center',
    lineHeight: 22,
  },
  guestButton: {
    width: '100%',
  },
  tipsSection: {
    marginTop: Spacing.eight,
  },
  sectionTitle: {
    marginBottom: Spacing.three,
  },
  tipItem: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    lineHeight: 18,
  },
});

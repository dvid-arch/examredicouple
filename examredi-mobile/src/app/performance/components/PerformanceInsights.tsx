import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, AppGlassView } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PerformanceInsightsProps {
  streak: number;
  trend: string;
  latestScore: number;
}

export function PerformanceInsights({ streak, trend, latestScore }: PerformanceInsightsProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label" color="textSecondary" style={styles.title}>
        Performance Insights
      </AppText>
      <View style={styles.grid}>
        <InsightCard emoji="🔥" label="Streak" value={`${streak} days`} />
        <InsightCard emoji="📈" label="Trend" value={trend} />
        <InsightCard emoji="🎯" label="Latest" value={`${latestScore}%`} />
      </View>
    </View>
  );
}

function InsightCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <AppGlassView intensity={10} style={styles.card}>
      <View style={styles.content}>
        <AppText variant="h3" style={styles.emoji}>{emoji}</AppText>
        <View>
          <AppText variant="label" color="textSecondary" style={styles.cardLabel}>{label}</AppText>
          <AppText variant="bodyBold">{value}</AppText>
        </View>
      </View>
    </AppGlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.six,
  },
  title: {
    marginBottom: Spacing.two,
  },
  grid: {
    gap: Spacing.two,
  },
  card: {
    padding: Spacing.three,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  emoji: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: 10,
    marginBottom: Spacing.quarter,
  },
});

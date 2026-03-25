import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface StatGridProps {
  attempts: number;
  average: number;
  best: number;
}

export function StatGrid({ attempts, average, best }: StatGridProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.statsRow}>
      <StatCard label="Sessions" value={attempts.toString()} color={theme.primary} />
      <StatCard label="Average" value={`${Math.round(average)}%`} color={theme.accent} />
      <StatCard label="Best" value={`${Math.round(best)}%`} color={theme.secondary} />
    </View>
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
  const theme = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <AppText variant="label" style={styles.statLabel}>
        {label}
      </AppText>
      <AppText variant="h3">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  indicator: {
    width: 24,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.two,
  },
  statLabel: {
    marginBottom: Spacing.half,
    fontSize: 10,
  },
});

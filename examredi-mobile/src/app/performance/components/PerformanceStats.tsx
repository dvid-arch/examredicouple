import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PerformanceStatsProps {
  attempts: number;
  average: number;
  best: number;
}

export function PerformanceStats({ attempts, average, best }: PerformanceStatsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <StatBox label="Total Attempts" value={String(attempts)} color={theme.primary} />
      <StatBox label="Average Score" value={`${Math.round(average)}%`} color={theme.accent} />
      <StatBox label="Best Score" value={`${Math.round(best)}%`} color={theme.secondary} />
    </View>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <AppText variant="label" style={styles.label}>{label}</AppText>
      <AppText variant="h3">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  statBox: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  accent: {
    width: 20,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: 10,
    marginBottom: Spacing.half,
  },
});

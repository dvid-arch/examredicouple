import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard, AppText, AppButton } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PerformanceResult } from '@/types/practice';

interface SessionHistoryProps {
  results: PerformanceResult[];
  onRefresh: () => void;
}

export function SessionHistory({ results, onRefresh }: SessionHistoryProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="label" color="textSecondary" style={styles.title}>
        Recent Sessions
      </AppText>
      <AppCard style={styles.card}>
        {results.slice(0, 8).map((result, index) => {
          const percentage = result.totalQuestions > 0 
            ? Math.round((result.score / result.totalQuestions) * 100) 
            : 0;
            
          const statusColor = percentage >= 70 ? theme.secondary : percentage >= 50 ? theme.accent : theme.error;

          return (
            <View 
              key={result._id} 
              style={[
                styles.item, 
                index !== Math.min(results.length, 8) - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
              ]}
            >
              <View style={styles.info}>
                <AppText variant="bodyBold">{result.subject}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {new Date(result.date).toLocaleDateString()} · {result.type.toUpperCase()}
                </AppText>
              </View>
              <View style={[styles.scoreBox, { borderLeftColor: statusColor }]}>
                <AppText variant="bodyBold">{percentage}%</AppText>
                <AppText variant="caption" color="textSecondary">
                  {result.score}/{result.totalQuestions}
                </AppText>
              </View>
            </View>
          );
        })}
        <AppButton 
          label="Refresh Data" 
          variant="ghost" 
          onPress={onRefresh} 
          style={styles.refresh}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.six,
  },
  title: {
    marginBottom: Spacing.two,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
  },
  info: {
    flex: 1,
    gap: Spacing.quarter,
  },
  scoreBox: {
    alignItems: 'flex-end',
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
  },
  refresh: {
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    borderRadius: 0,
  },
});

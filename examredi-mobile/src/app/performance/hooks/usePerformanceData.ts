import React from 'react';
import { performanceService } from '@/services/performance-service';
import { PerformanceResult } from '@/types/practice';

export type PerformanceState =
  | { kind: 'loading' }
  | { kind: 'ready'; results: PerformanceResult[]; summary: any; streak: number; trend: string }
  | { kind: 'empty' }
  | { kind: 'locked'; message: string }
  | { kind: 'error'; message: string };

export function usePerformanceData() {
  const [state, setState] = React.useState<PerformanceState>({ kind: 'loading' });

  const loadPerformance = React.useCallback(async () => {
    setState({ kind: 'loading' });

    try {
      const results = await performanceService.getPerformanceResults();

      if (results.length === 0) {
        setState({ kind: 'empty' });
        return;
      }

      const summary = performanceService.buildSummary(results);
      const streak = calculateStreak(results);
      const trend = getTrendIndicator(results);

      setState({ kind: 'ready', results, summary, streak, trend });
    } catch (error) {
      const message = (error as Error).message || 'Could not load performance right now.';
      if (message.toLowerCase().includes('pro feature')) {
        setState({ kind: 'locked', message });
      } else {
        setState({ kind: 'error', message });
      }
    }
  }, []);

  React.useEffect(() => {
    void loadPerformance();
  }, [loadPerformance]);

  return { state, refresh: loadPerformance };
}

function calculateStreak(results: PerformanceResult[]): number {
  if (results.length === 0) return 0;
  let streak = 1;
  const dates = results.map((r) => new Date(r.date).toDateString());
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

function getTrendIndicator(results: PerformanceResult[]): string {
  if (results.length < 2) return 'Steady';
  const recent = results.slice(0, Math.min(5, results.length));
  const avgRecent = recent.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / recent.length;
  const older = results.slice(Math.min(5, results.length), 10);
  if (older.length === 0) return 'Steady';
  const avgOlder = older.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / older.length;
  const diff = avgRecent - avgOlder;
  if (diff > 5) return 'Improving';
  if (diff < -5) return 'Declining';
  return 'Steady';
}

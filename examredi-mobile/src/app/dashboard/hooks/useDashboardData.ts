import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { learningService, RevisionQueueItem, WeakTopicInsight } from '@/services/learning-service';
import { performanceService } from '@/services/performance-service';
import { PerformanceResult } from '@/types/practice';

export function useDashboardData() {
  const { user, isAuthenticated } = useAuth();
  const [performanceData, setPerformanceData] = React.useState<PerformanceResult[]>([]);
  const [stats, setStats] = React.useState({ attempts: 0, average: 0, best: 0 });
  const [weakTopics, setWeakTopics] = React.useState<WeakTopicInsight[]>([]);
  const [revisionQueue, setRevisionQueue] = React.useState<RevisionQueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isAuthenticated) {
      void loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const results = await performanceService.getPerformanceResults();
      setPerformanceData(results);
      setStats(performanceService.buildSummary(results));
      setWeakTopics(learningService.buildWeakTopicInsights(results));
      setRevisionQueue(learningService.buildRevisionQueue(results));
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return {
    user,
    isAuthenticated,
    performanceData,
    stats,
    weakTopics,
    revisionQueue,
    loading,
    getGreeting,
    userName: user?.fullName?.split(' ')[0] || 'Scholar',
    recentSession: performanceData[0],
    refresh: loadData,
  };
}

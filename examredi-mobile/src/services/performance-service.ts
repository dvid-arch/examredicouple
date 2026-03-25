import { apiClient } from '@/services/api-client';
import { PerformanceResult, PracticeSessionCompletion } from '@/types/practice';

const getAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
};

export const performanceService = {
  async savePracticeResult(payload: PracticeSessionCompletion): Promise<void> {
    await apiClient('/data/performance', {
      method: 'POST',
      body: {
        paperId: payload.sessionId,
        exam: 'UTME Practice',
        subject: payload.setup.subjects.join(', '),
        year: Number(payload.setup.toYear) || new Date().getFullYear(),
        score: payload.score,
        totalQuestions: payload.totalQuestions,
        type: payload.setup.mode === 'mock' ? 'exam' : 'practice',
        topicBreakdown: payload.subjectBreakdown,
        incorrectQuestions: payload.incorrectQuestions,
        completedAt: payload.completedAt,
      },
    });
  },

  async getPerformanceResults(): Promise<PerformanceResult[]> {
    return apiClient<PerformanceResult[]>('/data/performance');
  },

  buildSummary(results: PerformanceResult[]) {
    const percentages = results
      .filter((item) => item.totalQuestions > 0)
      .map((item) => Math.round((item.score / item.totalQuestions) * 100));

    return {
      attempts: results.length,
      average: getAverage(percentages),
      best: percentages.length > 0 ? Math.max(...percentages) : 0,
      latest: percentages[0] ?? 0,
    };
  },
};

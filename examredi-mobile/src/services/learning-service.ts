import {
  ENGLISH_SUBJECT,
  MAX_PRACTICE_SUBJECTS,
  PerformanceResult,
  PracticeSetupDraft,
  SUBJECT_OPTIONS,
  SubjectPerformanceBreakdown,
} from '@/types/practice';

export type WeakTopicInsight = {
  subject: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
};

export type RevisionQueueItem = {
  id: string;
  subject: string;
  mistakes: number;
  sessionDate: number;
  scorePercent: number;
};

const roundPercent = (numerator: number, denominator: number): number => {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
};

const getBreakdownEntries = (
  result: PerformanceResult,
): SubjectPerformanceBreakdown => {
  if (result.topicBreakdown && Object.keys(result.topicBreakdown).length > 0) {
    return result.topicBreakdown;
  }

  // Fallback for older results that do not have topic breakdown payload.
  return {
    [result.subject]: {
      correct: result.score,
      total: result.totalQuestions,
    },
  };
};

const normalizeSubject = (subject: string): string => {
  const exact = SUBJECT_OPTIONS.find(
    (option) => option.toLowerCase() === subject.trim().toLowerCase(),
  );

  return exact ?? subject.trim();
};

export const learningService = {
  buildWeakTopicInsights(results: PerformanceResult[]): WeakTopicInsight[] {
    const aggregate = new Map<string, { correct: number; total: number }>();

    results.forEach((result) => {
      const breakdown = getBreakdownEntries(result);

      Object.entries(breakdown).forEach(([rawSubject, stats]) => {
        const subject = normalizeSubject(rawSubject);
        const current = aggregate.get(subject) ?? { correct: 0, total: 0 };

        current.correct += stats.correct;
        current.total += stats.total;

        aggregate.set(subject, current);
      });
    });

    return [...aggregate.entries()]
      .filter(([, stats]) => stats.total > 0)
      .map(([subject, stats]) => ({
        subject,
        accuracy: roundPercent(stats.correct, stats.total),
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
      }))
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) {
          return a.accuracy - b.accuracy;
        }

        return b.totalQuestions - a.totalQuestions;
      })
      .slice(0, 4);
  },

  buildRevisionQueue(results: PerformanceResult[]): RevisionQueueItem[] {
    return results
      .map((result) => {
        const mistakes = result.incorrectQuestions?.length ?? 0;
        if (mistakes === 0 || result.totalQuestions <= 0) {
          return null;
        }

        const firstSubject =
          result.subject.split(',')[0]?.trim() || result.subject;

        return {
          id: result._id,
          subject: normalizeSubject(firstSubject),
          mistakes,
          sessionDate: result.date,
          scorePercent: roundPercent(result.score, result.totalQuestions),
        };
      })
      .filter((item): item is RevisionQueueItem => item !== null)
      .sort((a, b) => b.sessionDate - a.sessionDate)
      .slice(0, 6);
  },

  buildSubjectDrillDraft(subject: string): PracticeSetupDraft {
    const currentYear = new Date().getFullYear();
    const picks = [ENGLISH_SUBJECT, normalizeSubject(subject)];

    const defaults = ['Mathematics', 'Biology', 'Chemistry', 'Physics'];

    defaults.forEach((item) => {
      if (picks.length >= MAX_PRACTICE_SUBJECTS) {
        return;
      }

      if (!picks.includes(item)) {
        picks.push(item);
      }
    });

    return {
      mode: 'study',
      subjects: picks.slice(0, MAX_PRACTICE_SUBJECTS),
      fromYear: String(currentYear - 7),
      toYear: String(currentYear),
      durationMinutes: '25',
    };
  },
};

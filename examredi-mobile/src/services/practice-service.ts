import { apiClient } from '@/services/api-client';
import {
  ENGLISH_SUBJECT,
  PracticePaper,
  PracticeQuestion,
  PracticeSetupDraft,
  PreparedPracticeQuestion,
  PreparedPracticeSession,
} from '@/types/practice';

const shuffle = <T>(items: T[]): T[] => {
  const next = [...items];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
};

const normalizeQuestionId = (
  question: PracticeQuestion,
  index: number,
): string => {
  const raw =
    (question as { id?: string; _id?: string }).id ??
    (question as { id?: string; _id?: string })._id;

  if (raw && typeof raw === 'string') {
    return raw;
  }

  return `q-${index + 1}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizePapers = (
  papers: Array<Record<string, unknown>>,
): PracticePaper[] => {
  return papers
    .map((paper) => {
      const rawQuestions = Array.isArray(paper.questions)
        ? (paper.questions as PracticeQuestion[])
        : [];

      const questions = rawQuestions
        .filter((question) => question && typeof question.question === 'string')
        .map((question, index) => ({
          ...question,
          id: normalizeQuestionId(question, index),
          explanation:
            typeof question.explanation === 'string'
              ? question.explanation
              : undefined,
        }));

      return {
        id:
          (paper.id as string | undefined) ??
          (paper._id as string | undefined) ??
          `paper-${Math.random().toString(36).slice(2, 9)}`,
        subject: String(paper.subject ?? ''),
        year: Number(paper.year ?? 0),
        exam: String(paper.exam ?? 'UTME'),
        questions,
      } as PracticePaper;
    })
    .filter((paper) => paper.subject.length > 0 && paper.year > 0);
};

const getQuestionCountPerSubject = (
  mode: PracticeSetupDraft['mode'],
  subject: string,
): number => {
  if (mode === 'study') {
    return subject === ENGLISH_SUBJECT ? 12 : 8;
  }

  if (mode === 'practice') {
    return subject === ENGLISH_SUBJECT ? 20 : 15;
  }

  return subject === ENGLISH_SUBJECT ? 40 : 30;
};

export const practiceService = {
  async fetchPapers(): Promise<PracticePaper[]> {
    const papers =
      await apiClient<Array<Record<string, unknown>>>('/data/papers');
    return normalizePapers(papers);
  },

  buildSession(
    setup: PracticeSetupDraft,
    papers: PracticePaper[],
  ): PreparedPracticeSession {
    const fromYear = Number(setup.fromYear);
    const toYear = Number(setup.toYear);

    const selectedQuestions: PreparedPracticeQuestion[] = [];

    setup.subjects.forEach((subject) => {
      const matchingPapers = papers.filter(
        (paper) =>
          paper.subject.toLowerCase() === subject.toLowerCase() &&
          paper.year >= fromYear &&
          paper.year <= toYear,
      );

      const pool = shuffle(
        matchingPapers.flatMap((paper) =>
          paper.questions.map((question) => ({
            ...question,
            subject: paper.subject,
            year: paper.year,
            exam: paper.exam,
            paperId: paper.id,
          })),
        ),
      );

      const count = getQuestionCountPerSubject(setup.mode, subject);
      selectedQuestions.push(...pool.slice(0, count));
    });

    const sessionQuestions = shuffle(selectedQuestions);

    return {
      id: `practice-${Date.now()}`,
      setup,
      questions: sessionQuestions,
      createdAt: Date.now(),
    };
  },
};

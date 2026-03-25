export type PracticeMode = 'study' | 'practice' | 'mock';

export type PracticeSetupDraft = {
  mode: PracticeMode;
  subjects: string[];
  fromYear: string;
  toYear: string;
  durationMinutes: string;
};

export type PracticeQuestionOption = {
  text: string;
};

export type PracticeQuestion = {
  id: string;
  question: string;
  options: Record<string, PracticeQuestionOption>;
  answer: string;
  explanation?: string;
};

export type PracticePaper = {
  id: string;
  subject: string;
  year: number;
  exam: string;
  questions: PracticeQuestion[];
};

export type PreparedPracticeQuestion = PracticeQuestion & {
  subject: string;
  year: number;
  exam: string;
  paperId: string;
};

export type PreparedPracticeSession = {
  id: string;
  setup: PracticeSetupDraft;
  questions: PreparedPracticeQuestion[];
  createdAt: number;
};

export type SubjectPerformanceBreakdown = Record<
  string,
  {
    correct: number;
    total: number;
  }
>;

export type PracticeSessionCompletion = {
  sessionId: string;
  setup: PracticeSetupDraft;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: number;
  subjectBreakdown: SubjectPerformanceBreakdown;
  incorrectQuestions: string[];
};

export type PerformanceResult = {
  _id: string;
  userId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  type: 'practice' | 'exam';
  topicBreakdown?: SubjectPerformanceBreakdown;
  incorrectQuestions?: string[];
  date: number;
  metadata?: {
    paperId?: string;
    exam?: string;
    year?: number;
  };
};

export const ENGLISH_SUBJECT = 'English Language';
export const MIN_PRACTICE_YEAR = 1990;
export const MAX_PRACTICE_SUBJECTS = 4;

export const SUBJECT_OPTIONS = [
  ENGLISH_SUBJECT,
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Economics',
  'Government',
  'Literature in English',
] as const;

const currentYear = new Date().getFullYear();

export const defaultPracticeDraft: PracticeSetupDraft = {
  mode: 'practice',
  subjects: [ENGLISH_SUBJECT],
  fromYear: String(currentYear - 5),
  toYear: String(currentYear),
  durationMinutes: '30',
};

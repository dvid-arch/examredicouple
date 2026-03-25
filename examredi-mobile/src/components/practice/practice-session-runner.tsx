import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, AppCard } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  PracticeSessionCompletion,
  PreparedPracticeSession,
  SubjectPerformanceBreakdown,
} from '@/types/practice';

type PracticeSessionRunnerProps = {
  session: PreparedPracticeSession;
  onReset: () => void;
  onComplete?: (payload: PracticeSessionCompletion) => Promise<void>;
};

const formatMinutes = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
};

export function PracticeSessionRunner({
  session,
  onReset,
  onComplete,
}: PracticeSessionRunnerProps) {
  const theme = useTheme();
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [syncState, setSyncState] = React.useState<
    'idle' | 'saving' | 'saved' | 'failed'
  >('idle');

  const completionSentRef = React.useRef(false);

  const totalQuestions = session.questions.length;
  const currentQuestion = session.questions[index];
  const selectedOption = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const modeDurationSeconds = Math.max(
    0,
    Number(session.setup.durationMinutes || '0') * 60,
  );

  const [secondsLeft, setSecondsLeft] = React.useState(modeDurationSeconds);

  React.useEffect(() => {
    if (session.setup.mode === 'study') {
      return;
    }

    if (isSubmitted || secondsLeft <= 0) {
      if (!isSubmitted && secondsLeft <= 0) {
        setIsSubmitted(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, secondsLeft, session.setup.mode]);

  const progress =
    totalQuestions === 0 ? 0 : Math.round(((index + 1) / totalQuestions) * 100);

  const score = React.useMemo(() => {
    return session.questions.reduce((total, question) => {
      return answers[question.id] === question.answer ? total + 1 : total;
    }, 0);
  }, [answers, session.questions]);

  const answeredCount = React.useMemo(() => {
    return session.questions.reduce((count, question) => {
      return answers[question.id] ? count + 1 : count;
    }, 0);
  }, [answers, session.questions]);

  const completionPayload = React.useMemo<PracticeSessionCompletion>(() => {
    const subjectBreakdown: SubjectPerformanceBreakdown = {};
    const incorrectQuestions: string[] = [];

    session.questions.forEach((question) => {
      const key = question.subject;
      if (!subjectBreakdown[key]) {
        subjectBreakdown[key] = { correct: 0, total: 0 };
      }

      subjectBreakdown[key].total += 1;

      if (answers[question.id] === question.answer) {
        subjectBreakdown[key].correct += 1;
      } else {
        incorrectQuestions.push(question.id);
      }
    });

    const percentage =
      totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return {
      sessionId: session.id,
      setup: session.setup,
      score,
      totalQuestions,
      percentage,
      completedAt: Date.now(),
      subjectBreakdown,
      incorrectQuestions,
    };
  }, [
    answers,
    score,
    session.id,
    session.questions,
    session.setup,
    totalQuestions,
  ]);

  React.useEffect(() => {
    if (!isSubmitted || !onComplete || completionSentRef.current) {
      return;
    }

    completionSentRef.current = true;
    setSyncState('saving');

    onComplete(completionPayload)
      .then(() => {
        setSyncState('saved');
      })
      .catch(() => {
        setSyncState('failed');
      });
  }, [completionPayload, isSubmitted, onComplete]);

  const handleExitSession = React.useCallback(() => {
    if (isSubmitted) {
      onReset();
      return;
    }

    const hasProgress = answeredCount > 0 || index > 0;

    if (!hasProgress) {
      onReset();
      return;
    }

    Alert.alert(
      'Exit practice?',
      'Your current progress will be lost if you exit now.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: onReset,
        },
      ],
    );
  }, [answeredCount, index, isSubmitted, onReset]);

  if (totalQuestions === 0) {
    return (
      <AppCard>
        <ThemedText type="smallBold">No questions available</ThemedText>
        <ThemedText style={styles.metaText} themeColor="textSecondary">
          Try adjusting the year range or selected subjects to include available
          papers.
        </ThemedText>
        <AppButton label="Back to setup" variant="outline" onPress={onReset} />
      </AppCard>
    );
  }

  if (isSubmitted) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const scoreColor =
      percentage >= 70
        ? theme.accent
        : percentage >= 50
          ? theme.secondary
          : '#EF4444';

    return (
      <AppCard>
        <ThemedText type="smallBold">🎉 Session complete!</ThemedText>
        <ThemedText style={styles.metaText} themeColor="textSecondary">
          {session.setup.mode.toUpperCase()} mode ·{' '}
          {session.setup.subjects.join(', ')}
        </ThemedText>

        <ThemedView
          type="backgroundElement"
          style={[
            styles.scoreBox,
            { borderTopColor: scoreColor, borderTopWidth: 4 },
          ]}
        >
          <ThemedText style={[styles.scorePercentage, { color: scoreColor }]}>
            {percentage}%
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {score} of {totalQuestions} questions correct
          </ThemedText>
          {syncState === 'saving' ? (
            <ThemedText type="caption" themeColor="textSecondary">
              💾 Saving your result...
            </ThemedText>
          ) : null}
          {syncState === 'saved' ? (
            <ThemedText type="caption" style={styles.successText}>
              ✅ Result saved to your performance history
            </ThemedText>
          ) : null}
          {syncState === 'failed' ? (
            <ThemedText type="caption" style={styles.warningText}>
              ⚠️ Could not save this result right now
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedText type="smallBold" style={styles.breakdownTitle}>
          📊 Subject Breakdown
        </ThemedText>
        <View style={styles.breakdownWrap}>
          {Object.entries(completionPayload.subjectBreakdown).map(
            ([subject, stats]) => {
              const subjectPercent = Math.round(
                (stats.correct / stats.total) * 100,
              );

              return (
                <View key={subject} style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <ThemedText type="caption">{subject}</ThemedText>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${subjectPercent}%`,
                            backgroundColor: theme.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <ThemedText type="smallBold">{subjectPercent}%</ThemedText>
                </View>
              );
            },
          )}
        </View>

        <View style={styles.rowActions}>
          <AppButton
            label="New Setup"
            variant="outline"
            onPress={onReset}
            style={styles.actionButton}
          />
          <AppButton
            label="Retake"
            onPress={() => {
              setAnswers({});
              setIndex(0);
              setIsSubmitted(false);
              setSecondsLeft(modeDurationSeconds);
              setSyncState('idle');
              completionSentRef.current = false;
            }}
            style={styles.actionButton}
          />
        </View>
      </AppCard>
    );
  }

  const optionEntries = Object.entries(currentQuestion.options ?? {});
  const timerColor =
    secondsLeft <= 60
      ? theme.secondary
      : secondsLeft <= 300
        ? theme.accent
        : theme.primary;

  return (
    <AppCard>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="smallBold">
            Question {index + 1} of {totalQuestions}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {currentQuestion.subject} • {currentQuestion.year}
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          {session.setup.mode !== 'study' ? (
            <ThemedView
              type="backgroundElement"
              style={[
                styles.timerPill,
                { borderColor: timerColor, borderWidth: 2 },
              ]}
            >
              <ThemedText style={[styles.timerText, { color: timerColor }]}>
                ⏱️ {formatMinutes(secondsLeft)}
              </ThemedText>
            </ThemedView>
          ) : null}
          <Pressable onPress={handleExitSession} style={styles.exitPressable}>
            <ThemedView
              type="backgroundElement"
              style={[styles.exitPill, { borderColor: theme.border }]}
            >
              <ThemedText type="caption" themeColor="textSecondary">
                Exit
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.backgroundSelected },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <ThemedText
          type="caption"
          themeColor="textSecondary"
          style={styles.progressLabel}
        >
          {answeredCount}/{totalQuestions} answered • {progress}% complete
        </ThemedText>
      </View>

      {/* Question Navigator Pills */}
      <ThemedText
        type="caption"
        style={styles.navigatorLabel}
        themeColor="textSecondary"
      >
        Jump to question
      </ThemedText>
      <View style={styles.questionPills}>
        {session.questions.map((question, questionIndex) => {
          const hasAnswer = Boolean(answers[question.id]);
          const isActive = questionIndex === index;
          const isCorrect =
            hasAnswer && answers[question.id] === question.answer;

          return (
            <Pressable
              key={question.id}
              onPress={() => setIndex(questionIndex)}
              style={styles.pillPressable}
            >
              <ThemedView
                type={
                  isActive
                    ? 'backgroundSelected'
                    : isCorrect
                      ? 'backgroundSelected'
                      : 'backgroundElement'
                }
                style={[
                  styles.questionPill,
                  isActive && { borderColor: theme.primary, borderWidth: 2 },
                  isCorrect && { borderColor: theme.accent, borderWidth: 2 },
                ]}
              >
                <ThemedText type="caption" style={styles.pillText}>
                  {questionIndex + 1}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </View>

      {/* Question Text */}
      <ThemedText style={styles.questionText}>
        {currentQuestion.question}
      </ThemedText>

      {/* Options */}
      <View style={styles.optionsList}>
        {optionEntries.map(([key, option]) => {
          const active = selectedOption === key;
          const isCorrect = key === currentQuestion.answer;
          const showCorrect = selectedOption && isCorrect;

          return (
            <Pressable
              key={key}
              onPress={() =>
                setAnswers((current) => ({
                  ...current,
                  [currentQuestion.id]: key,
                }))
              }
              style={styles.optionPressable}
            >
              <View
                style={[
                  styles.optionBox,
                  {
                    backgroundColor: active
                      ? theme.primaryLight
                      : showCorrect
                        ? theme.muted
                        : theme.backgroundElement,
                    borderColor: showCorrect ? theme.accent : theme.border,
                    borderWidth: showCorrect ? 2 : 1,
                  },
                ]}
              >
                <ThemedText type="smallBold">{key}</ThemedText>
                <ThemedText style={styles.optionText}>{option.text}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Feedback Section */}
      {selectedOption ? (
        <View style={styles.feedbackBox}>
          {selectedOption === currentQuestion.answer ? (
            <>
              <ThemedText style={styles.successText}>
                ✅ Correct answer!
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={styles.warningText}>
                ❌ Incorrect. The correct answer is {currentQuestion.answer}.
              </ThemedText>
            </>
          )}

          {currentQuestion.explanation ? (
            <ThemedText
              type="caption"
              themeColor="textSecondary"
              style={styles.explanationText}
            >
              💡 {currentQuestion.explanation}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      {/* Navigation */}
      <View style={styles.rowActions}>
        <AppButton
          label="← Previous"
          variant="outline"
          disabled={index === 0}
          onPress={() => setIndex((current) => Math.max(0, current - 1))}
          style={styles.actionButton}
        />
        {index + 1 >= totalQuestions ? (
          <AppButton
            label="Submit →"
            onPress={() => setIsSubmitted(true)}
            style={styles.actionButton}
          />
        ) : (
          <AppButton
            label="Next →"
            onPress={() =>
              setIndex((current) => Math.min(totalQuestions - 1, current + 1))
            }
            style={styles.actionButton}
          />
        )}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  metaText: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  scoreBox: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  successText: {
    color: '#166534',
    fontWeight: '600',
  },
  warningText: {
    color: '#92400E',
    fontWeight: '600',
  },
  breakdownTitle: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  breakdownWrap: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  breakdownLeft: {
    flex: 1,
    gap: Spacing.one,
  },
  progressBar: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  timerPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  exitPressable: {
    borderRadius: Radius.full,
  },
  exitPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: 11,
  },
  navigatorLabel: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
  },
  questionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  pillPressable: {
    borderRadius: Radius.full,
  },
  questionPill: {
    minWidth: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  pillText: {
    fontWeight: '600',
  },
  questionText: {
    marginTop: Spacing.three,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  optionsList: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  optionPressable: {
    borderRadius: Radius.md,
  },
  optionBox: {
    borderRadius: Radius.md,
    padding: Spacing.two,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  optionText: {
    flex: 1,
    lineHeight: 22,
  },
  feedbackBox: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  explanationText: {
    lineHeight: 18,
    marginTop: Spacing.one,
  },
});

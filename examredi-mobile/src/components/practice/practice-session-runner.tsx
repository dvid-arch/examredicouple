import React from 'react';
import { Alert, Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { AppButton, AppCard, AppText, AppGlassView } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  PracticeSessionCompletion,
  PreparedPracticeSession,
  SubjectPerformanceBreakdown,
} from '@/types/practice';
import * as Haptics from 'expo-haptics';

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
  const [syncState, setSyncState] = React.useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const completionSentRef = React.useRef(false);
  const totalQuestions = session.questions.length;
  const currentQuestion = session.questions[index];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const mode = session.setup.mode;

  const modeDurationSeconds = Math.max(0, Number(session.setup.durationMinutes || '0') * 60);
  const [secondsLeft, setSecondsLeft] = React.useState(modeDurationSeconds);

  React.useEffect(() => {
    if (mode === 'study' || isSubmitted || secondsLeft <= 0) {
      if (!isSubmitted && secondsLeft <= 0 && mode !== 'study') {
        setIsSubmitted(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, secondsLeft, mode]);

  const progress = totalQuestions === 0 ? 0 : Math.round(((index + 1) / totalQuestions) * 100);
  const answeredCount = React.useMemo(() => {
    return session.questions.reduce((count, question) => answers[question.id] ? count + 1 : count, 0);
  }, [answers, session.questions]);

  // Mode UI Config
  const modeConfig = {
    study: { color: theme.primary, label: 'Study Mode', icon: '📚' },
    practice: { color: theme.secondary, label: 'Practice Mode', icon: '✏️' },
    mock: { color: theme.accent, label: 'Mock Exam', icon: '🎯' },
  }[mode];

  const handleOptionSelect = (key: string) => {
    if (isSubmitted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: key }));
  };

  const handleExitSession = () => {
    if (isSubmitted) { onReset(); return; }
    Alert.alert('Exit session?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: onReset },
    ]);
  };

  const score = React.useMemo(() => {
    return session.questions.reduce((total, q) => answers[q.id] === q.answer ? total + 1 : total, 0);
  }, [answers, session.questions]);

  const completionPayload = React.useMemo<PracticeSessionCompletion>(() => {
    const subjectBreakdown: SubjectPerformanceBreakdown = {};
    const incorrectQuestions: string[] = [];
    session.questions.forEach((q) => {
      if (!subjectBreakdown[q.subject]) subjectBreakdown[q.subject] = { correct: 0, total: 0 };
      subjectBreakdown[q.subject].total += 1;
      if (answers[q.id] === q.answer) subjectBreakdown[q.subject].correct += 1;
      else incorrectQuestions.push(q.id);
    });
    return {
      sessionId: session.id,
      setup: session.setup,
      score,
      totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
      completedAt: Date.now(),
      subjectBreakdown,
      incorrectQuestions,
    };
  }, [answers, score, session, totalQuestions]);

  React.useEffect(() => {
    if (!isSubmitted || !onComplete || completionSentRef.current) return;
    completionSentRef.current = true;
    setSyncState('saving');
    onComplete(completionPayload).then(() => setSyncState('saved')).catch(() => setSyncState('failed'));
  }, [isSubmitted, onComplete, completionPayload]);

  if (isSubmitted) {
    const percentage = completionPayload.percentage;
    const scoreColor = percentage >= 70 ? theme.secondary : percentage >= 50 ? theme.accent : theme.error;

    return (
      <AppCard style={styles.resultCard}>
        <AppText variant="h2" align="center">🎉 Finished!</AppText>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <AppText variant="h1" style={{ color: scoreColor }}>{percentage}%</AppText>
          <AppText variant="caption" color="textSecondary">{score} / {totalQuestions}</AppText>
        </View>
        
        <View style={styles.breakdownList}>
          {Object.entries(completionPayload.subjectBreakdown).map(([subject, stats]) => {
            const p = Math.round((stats.correct / stats.total) * 100);
            return (
              <View key={subject} style={styles.breakdownItem}>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyBold">{subject}</AppText>
                  <View style={styles.miniProgressTrack}>
                    <View style={[styles.miniProgressFill, { width: `${p}%`, backgroundColor: theme.primary }]} />
                  </View>
                </View>
                <AppText variant="bodyBold">{p}%</AppText>
              </View>
            );
          })}
        </View>

        <View style={styles.resultActions}>
          <AppButton label="New Session" variant="outline" onPress={onReset} style={{ flex: 1 }} />
          <AppButton label="Review" variant="primary" style={{ flex: 1 }} />
        </View>
      </AppCard>
    );
  }

  const timerColor = secondsLeft <= 60 ? theme.error : secondsLeft <= 300 ? theme.accent : theme.textSecondary;

  return (
    <View style={styles.container}>
      {/* Mode Header */}
      <AppGlassView intensity={10} style={[styles.modeHeader, { borderLeftColor: modeConfig.color, borderLeftWidth: 4 }]}>
        <View style={styles.headerInfo}>
          <AppText variant="label" color="textSecondary">{modeConfig.icon} {modeConfig.label}</AppText>
          <AppText variant="h3">{currentQuestion.subject}</AppText>
        </View>
        <View style={styles.headerControls}>
          {mode !== 'study' && (
            <AppText variant="bodyBold" style={{ color: timerColor }}>{formatMinutes(secondsLeft)}</AppText>
          )}
          <Pressable onPress={handleExitSession} style={styles.exitBtn}>
            <AppText variant="caption" color="textSecondary">Exit</AppText>
          </Pressable>
        </View>
      </AppGlassView>

      {/* Horizontal Navigator */}
      <View style={styles.navContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {session.questions.map((q, idx) => {
            const isCurrent = idx === index;
            const isAnswered = !!answers[q.id];
            return (
              <Pressable 
                key={q.id} 
                onPress={() => setIndex(idx)}
                style={[
                  styles.navPill,
                  isCurrent && { backgroundColor: theme.primary, borderColor: theme.primary },
                  !isCurrent && isAnswered && { borderColor: theme.primary },
                  !isCurrent && !isAnswered && { borderColor: theme.border },
                ]}
              >
                <AppText variant="caption" style={{ color: isCurrent ? 'white' : theme.text }}>{idx + 1}</AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Question Card */}
      <AppCard style={styles.questionCard}>
        <AppText variant="bodyBold" style={styles.questionText}>{currentQuestion.question}</AppText>
        
        <View style={styles.optionsList}>
          {Object.entries(currentQuestion.options).map(([key, opt]) => {
            const isSelected = selectedOption === key;
            const isCorrect = key === currentQuestion.answer;
            const showFeedback = (mode === 'study' && selectedOption) || (isSubmitted);
            
            return (
              <Pressable 
                key={key} 
                onPress={() => handleOptionSelect(key)}
                style={[
                  styles.optionBtn,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  isSelected && { borderColor: theme.primary, borderWidth: 2 },
                  showFeedback && isCorrect && { borderColor: theme.secondary, borderWidth: 2, backgroundColor: theme.secondary + '10' },
                  showFeedback && isSelected && !isCorrect && { borderColor: theme.error, borderWidth: 2, backgroundColor: theme.error + '10' },
                ]}
              >
                <View style={[styles.optionKey, isSelected && { backgroundColor: theme.primary }]}>
                  <AppText variant="label" style={{ color: isSelected ? 'white' : theme.text }}>{key}</AppText>
                </View>
                <AppText style={styles.optionLabel}>{opt.text}</AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Study Mode Feedback */}
        {mode === 'study' && selectedOption && (
          <AppGlassView intensity={5} style={styles.feedbackBox}>
            <AppText variant="bodyBold" color={selectedOption === currentQuestion.answer ? 'secondary' : 'error'}>
              {selectedOption === currentQuestion.answer ? '✅ Correct' : '❌ Incorrect'}
            </AppText>
            {currentQuestion.explanation && (
              <AppText variant="caption" color="textSecondary" style={styles.explanation}>
                {currentQuestion.explanation}
              </AppText>
            )}
          </AppGlassView>
        )}
      </AppCard>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <AppButton 
          label="Previous" 
          variant="ghost" 
          disabled={index === 0} 
          onPress={() => setIndex(i => i - 1)} 
          style={{ flex: 1 }}
        />
        <AppText variant="caption" color="textSecondary">{index + 1} / {totalQuestions}</AppText>
        {index === totalQuestions - 1 ? (
          <AppButton label="Submit" variant="primary" onPress={() => setIsSubmitted(true)} style={{ flex: 1 }} />
        ) : (
          <AppButton label="Next" variant="primary" onPress={() => setIndex(i => i + 1)} style={{ flex: 1 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  modeHeader: {
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    gap: Spacing.quarter,
  },
  headerControls: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  exitBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  navContainer: {
    height: 44,
  },
  navScroll: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
    alignItems: 'center',
  },
  navPill: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCard: {
    padding: Spacing.four,
    minHeight: 300,
  },
  questionText: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: Spacing.four,
  },
  optionsList: {
    gap: Spacing.two,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.three,
  },
  optionKey: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
  },
  feedbackBox: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  explanation: {
    marginTop: Spacing.one,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.two,
  },
  resultCard: {
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.four,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
  breakdownList: {
    width: '100%',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  miniProgressTrack: {
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginTop: Spacing.one,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
    marginTop: Spacing.four,
  },
});

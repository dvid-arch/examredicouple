import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, AppCard, AppButton, AppInput, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { 
  PracticeMode, 
  PracticeSetupDraft, 
  SUBJECT_OPTIONS, 
  ENGLISH_SUBJECT, 
  MAX_PRACTICE_SUBJECTS,
  MIN_PRACTICE_YEAR,
  defaultPracticeDraft
} from '@/types/practice';
import { practiceSetupStorage } from '@/services/practice-setup-storage';

const MODE_OPTIONS: Array<{ label: string; value: PracticeMode; icon: string; description: string }> = [
  { label: 'Study', value: 'study', icon: '📚', description: 'At your pace' },
  { label: 'Practice', value: 'practice', icon: '✏️', description: 'Timed session' },
  { label: 'Mock', value: 'mock', icon: '🎯', description: 'Full exam' },
];

interface PracticeSetupProps {
  onApply: (draft: PracticeSetupDraft) => void;
  isApplying: boolean;
}

export function PracticeSetup({ onApply, isApplying }: PracticeSetupProps) {
  const theme = useTheme();
  const [draft, setDraft] = React.useState<PracticeSetupDraft>(defaultPracticeDraft);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    practiceSetupStorage.getDraft().then(stored => {
      setDraft(stored);
      setLoading(false);
    });
  }, []);

  const toggleSubject = (subject: string) => {
    setDraft(current => {
      if (subject === ENGLISH_SUBJECT && current.subjects.includes(subject)) return current;
      const subjects = current.subjects.includes(subject)
        ? current.subjects.filter(s => s !== subject)
        : current.subjects.length < MAX_PRACTICE_SUBJECTS ? [...current.subjects, subject] : current.subjects;
      return { ...current, subjects };
    });
  };

  if (loading) return <AppText>Loading setup...</AppText>;

  return (
    <View style={styles.container}>
      {/* Mode Selection */}
      <View style={styles.section}>
        <AppText variant="label" color="textSecondary" style={styles.sectionTitle}>Session Mode</AppText>
        <View style={styles.modeGrid}>
          {MODE_OPTIONS.map(opt => (
            <Pressable 
              key={opt.value} 
              onPress={() => setDraft(d => ({ ...d, mode: opt.value }))}
              style={styles.modePressable}
            >
              <AppGlassView 
                intensity={draft.mode === opt.value ? 25 : 5}
                style={[
                  styles.modeCard, 
                  draft.mode === opt.value && { borderColor: theme.primary, borderWidth: 2 }
                ]}
              >
                <AppText variant="h2">{opt.icon}</AppText>
                <AppText variant="bodyBold" style={styles.modeLabel}>{opt.label}</AppText>
                <AppText variant="caption" color="textSecondary" align="center">{opt.description}</AppText>
              </AppGlassView>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Subject Selection */}
      <View style={styles.section}>
        <AppText variant="label" color="textSecondary" style={styles.sectionTitle}>
          Subjects ({draft.subjects.length}/{MAX_PRACTICE_SUBJECTS})
        </AppText>
        <View style={styles.chipGrid}>
          {SUBJECT_OPTIONS.map(subject => {
            const isSelected = draft.subjects.includes(subject);
            return (
              <Pressable key={subject} onPress={() => toggleSubject(subject)}>
                <View style={[
                  styles.chip, 
                  { backgroundColor: isSelected ? theme.primary : theme.backgroundElement },
                  isSelected && { borderColor: theme.primary, borderWidth: 1 }
                ]}>
                  <AppText variant="caption" color={isSelected ? 'white' : 'textSecondary'}>
                    {subject}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Configuration */}
      <AppGlassView intensity={5} style={styles.configCard}>
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <AppInput 
              label="From Year" 
              value={draft.fromYear} 
              onChangeText={v => setDraft(d => ({ ...d, fromYear: v }))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.inputCol}>
            <AppInput 
              label="To Year" 
              value={draft.toYear} 
              onChangeText={v => setDraft(d => ({ ...d, toYear: v }))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.inputCol}>
            <AppInput 
              label="Mins" 
              value={draft.durationMinutes} 
              onChangeText={v => setDraft(d => ({ ...d, durationMinutes: v }))}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </AppGlassView>

      <AppButton 
        label="Start Session" 
        onPress={() => onApply(draft)} 
        loading={isApplying} 
        style={styles.startButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.six,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modePressable: {
    flex: 1,
  },
  modeCard: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  modeLabel: {
    marginTop: Spacing.one,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
  configCard: {
    padding: Spacing.four,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  inputCol: {
    flex: 1,
  },
  startButton: {
    marginTop: Spacing.two,
  },
});

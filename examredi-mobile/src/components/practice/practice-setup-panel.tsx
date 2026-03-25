import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, AppCard } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { practiceSetupStorage } from '@/services/practice-setup-storage';
import {
  defaultPracticeDraft,
  ENGLISH_SUBJECT,
  MAX_PRACTICE_SUBJECTS,
  MIN_PRACTICE_YEAR,
  PracticeMode,
  PracticeSetupDraft,
  SUBJECT_OPTIONS,
} from '@/types/practice';

const MODE_OPTIONS: Array<{
  label: string;
  value: PracticeMode;
  icon: string;
  description: string;
}> = [
  {
    label: 'Study',
    value: 'study',
    icon: '📚',
    description: 'Learn at your pace',
  },
  {
    label: 'Practice',
    value: 'practice',
    icon: '✏️',
    description: 'Timed sessions',
  },
  { label: 'Mock', value: 'mock', icon: '🎯', description: 'Full exam' },
];

const currentYear = new Date().getFullYear();

const getValidationError = (draft: PracticeSetupDraft): string | null => {
  if (!draft.subjects.includes(ENGLISH_SUBJECT)) {
    return 'English Language is required for UTME practice setup.';
  }

  if (draft.subjects.length < 4) {
    return 'Select 4 subjects for a complete UTME session.';
  }

  const fromYear = Number(draft.fromYear);
  const toYear = Number(draft.toYear);

  if (
    Number.isNaN(fromYear) ||
    fromYear < MIN_PRACTICE_YEAR ||
    fromYear > currentYear
  ) {
    return `From year must be between ${MIN_PRACTICE_YEAR} and ${currentYear}.`;
  }

  if (
    Number.isNaN(toYear) ||
    toYear < MIN_PRACTICE_YEAR ||
    toYear > currentYear
  ) {
    return `To year must be between ${MIN_PRACTICE_YEAR} and ${currentYear}.`;
  }

  if (fromYear > toYear) {
    return 'From year cannot be greater than To year.';
  }

  const duration = Number(draft.durationMinutes);

  if (Number.isNaN(duration) || duration < 5 || duration > 240) {
    return 'Duration must be between 5 and 240 minutes.';
  }

  return null;
};

const buildSummary = (draft: PracticeSetupDraft): string => {
  const subjects = draft.subjects.join(', ');
  return `${draft.mode.toUpperCase()} mode • ${subjects} • ${draft.fromYear}-${draft.toYear} • ${draft.durationMinutes} mins`;
};

type PracticeSetupPanelProps = {
  isApplying?: boolean;
  onApply: (draft: PracticeSetupDraft) => void;
};

export function PracticeSetupPanel({
  isApplying = false,
  onApply,
}: PracticeSetupPanelProps) {
  const theme = useTheme();
  const [draft, setDraft] =
    React.useState<PracticeSetupDraft>(defaultPracticeDraft);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isHydrating, setIsHydrating] = React.useState(true);

  const validationError = React.useMemo(
    () => getValidationError(draft),
    [draft],
  );

  React.useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const storedDraft = await practiceSetupStorage.getDraft();
      if (isMounted) {
        setDraft(storedDraft);
        setPreview(buildSummary(storedDraft));
        setIsHydrating(false);
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isHydrating) {
      practiceSetupStorage.saveDraft(draft).catch(() => {
        // Keep setup in memory even if persistence fails.
      });
    }
  }, [draft, isHydrating]);

  const toggleSubject = (subject: string) => {
    setDraft((current) => {
      const hasSubject = current.subjects.includes(subject);

      if (subject === ENGLISH_SUBJECT && hasSubject) {
        return current;
      }

      if (hasSubject) {
        return {
          ...current,
          subjects: current.subjects.filter((item) => item !== subject),
        };
      }

      if (current.subjects.length >= MAX_PRACTICE_SUBJECTS) {
        return current;
      }

      return {
        ...current,
        subjects: [...current.subjects, subject],
      };
    });
  };

  const applySetup = () => {
    if (validationError) {
      return;
    }

    setPreview(buildSummary(draft));
    onApply(draft);
  };

  if (isHydrating) {
    return (
      <AppCard>
        <ThemedText type="smallBold">Loading setup...</ThemedText>
        <ThemedText style={styles.sectionCaption} themeColor="textSecondary">
          Restoring your last practice configuration.
        </ThemedText>
      </AppCard>
    );
  }

  return (
    <AppCard>
      <ThemedText type="smallBold">Practice Setup</ThemedText>
      <ThemedText style={styles.sectionCaption} themeColor="textSecondary">
        Train your way with custom sessions.
      </ThemedText>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionLabel}>
          📖 Mode
        </ThemedText>
        <View style={styles.modeGrid}>
          {MODE_OPTIONS.map((option) => {
            const isActive = draft.mode === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  setDraft((current) => ({ ...current, mode: option.value }))
                }
                style={[
                  styles.modeCard,
                  isActive && { borderColor: theme.primary, borderWidth: 2 },
                ]}
              >
                <ThemedText style={styles.modeIcon}>{option.icon}</ThemedText>
                <ThemedText type="smallBold">{option.label}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {option.description}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionLabel}>
          📚 Subjects ({draft.subjects.length}/{MAX_PRACTICE_SUBJECTS})
        </ThemedText>
        <View style={styles.rowWrap}>
          {SUBJECT_OPTIONS.map((subject) => {
            const isSelected = draft.subjects.includes(subject);

            return (
              <Pressable
                key={subject}
                onPress={() => toggleSubject(subject)}
                style={styles.choicePressable}
              >
                <ThemedView
                  type={isSelected ? 'backgroundSelected' : 'backgroundElement'}
                  style={[
                    styles.choicePill,
                    isSelected && {
                      borderColor: theme.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    themeColor={isSelected ? 'text' : 'textSecondary'}
                  >
                    {subject}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={styles.sectionLabel}>
          ⏱️ Year Range & Duration
        </ThemedText>
        <View style={styles.inputsRow}>
          <View style={styles.inputGroup}>
            <ThemedText type="caption" themeColor="textSecondary">
              From
            </ThemedText>
            <TextInput
              value={draft.fromYear}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, fromYear: value }))
              }
              placeholder="2010"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="caption" themeColor="textSecondary">
              To
            </ThemedText>
            <TextInput
              value={draft.toYear}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, toYear: value }))
              }
              placeholder={String(currentYear)}
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="caption" themeColor="textSecondary">
              Duration
            </ThemedText>
            <TextInput
              value={draft.durationMinutes}
              keyboardType="number-pad"
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, durationMinutes: value }))
              }
              placeholder="90"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {validationError ? (
        <ThemedView type="backgroundElement" style={styles.validationBox}>
          <ThemedText type="caption" style={styles.errorText}>
            ⚠️ {validationError}
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView type="backgroundElement" style={styles.validationBox}>
          <ThemedText type="caption" themeColor="textSecondary">
            ✅ Ready to start! Your setup is valid.
          </ThemedText>
        </ThemedView>
      )}

      <AppButton
        label="Start Practice"
        loading={isApplying}
        disabled={Boolean(validationError)}
        onPress={applySetup}
        style={styles.applyButton}
      />

      {preview ? (
        <ThemedView type="backgroundElement" style={styles.previewBox}>
          <ThemedText type="caption" style={styles.previewText}>
            {preview}
          </ThemedText>
        </ThemedView>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  sectionCaption: {
    marginTop: Spacing.one,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  section: {
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    gap: Spacing.one,
  },
  modeIcon: {
    fontSize: 28,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  choicePressable: {
    borderRadius: Radius.full,
  },
  choicePill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  inputGroup: {
    flex: 1,
    gap: Spacing.one,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    fontWeight: '500',
  },
  validationBox: {
    marginTop: Spacing.two,
    borderRadius: Radius.md,
    padding: Spacing.two,
  },
  errorText: {
    color: '#B91C1C',
  },
  applyButton: {
    marginTop: Spacing.three,
  },
  previewBox: {
    marginTop: Spacing.three,
    borderRadius: Radius.md,
    padding: Spacing.two,
  },
  previewText: {
    textAlign: 'center',
  },
});

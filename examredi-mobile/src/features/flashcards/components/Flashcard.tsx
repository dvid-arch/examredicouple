import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { AppText, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { Flashcard as FlashcardType } from '../types';

const { width } = Dimensions.get('window');

interface FlashcardProps {
  card: FlashcardType;
  onDifficultySelect: (difficulty: 'easy' | 'hard') => void;
}

export function Flashcard({ card, onDifficultySelect }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setIsFlipped(!isFlipped)} style={styles.pressable}>
        <AppGlassView intensity={20} style={[styles.card, isFlipped && styles.cardFlipped]}>
          {!isFlipped ? (
            <View style={styles.cardContent}>
              <AppText variant="caption" color="primary" style={styles.subjectTag}>
                {card.subject}
              </AppText>
              <AppText variant="h2" align="center" style={styles.questionText}>
                {card.question}
              </AppText>
              <AppText variant="caption" color="textSecondary" style={styles.hint}>
                Tap to reveal answer
              </AppText>
            </View>
          ) : (
            <View style={styles.cardContent}>
               <AppText variant="caption" color="textSecondary" style={styles.subjectTag}>
                Answer
              </AppText>
              <AppText variant="body" align="center" style={styles.answerText}>
                {card.answer}
              </AppText>
            </View>
          )}
        </AppGlassView>
      </Pressable>

      {isFlipped && (
        <View style={styles.actions}>
          <Pressable 
            onPress={() => onDifficultySelect('hard')}
            style={[styles.actionButton, styles.hardButton]}
          >
            <AppText variant="bodyBold" color="white">Need Review</AppText>
          </Pressable>
          <Pressable 
            onPress={() => onDifficultySelect('easy')}
            style={[styles.actionButton, styles.easyButton]}
          >
            <AppText variant="bodyBold" color="white">Mastered</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - Spacing.eight,
    height: 400,
    gap: Spacing.four,
  },
  pressable: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardFlipped: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  cardContent: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  subjectTag: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  questionText: {
    lineHeight: 32,
  },
  answerText: {
    lineHeight: 24,
  },
  hint: {
    marginTop: Spacing.four,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  hardButton: {
    backgroundColor: '#EF4444',
  },
  easyButton: {
    backgroundColor: '#10B981',
  },
});

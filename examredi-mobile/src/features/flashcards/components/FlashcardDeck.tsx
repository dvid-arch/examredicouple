import React, { useState } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import { AppScreen, AppText, AppButton, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { Flashcard } from './Flashcard';
import { Flashcard as FlashcardType } from '../types';

interface FlashcardDeckProps {
  cards: FlashcardType[];
  onComplete: (results: Record<string, 'easy' | 'hard'>) => void;
}

export function FlashcardDeck({ cards, onComplete }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, 'easy' | 'hard'>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleDifficultySelect = (difficulty: 'easy' | 'hard') => {
    const card = cards[currentIndex];
    const newResults = { ...results, [card.id]: difficulty };
    setResults(newResults);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const masteredCount = Object.values(results).filter(v => v === 'easy').length;
    return (
      <View style={styles.resultsContainer}>
        <AppGlassView intensity={20} style={styles.resultsCard}>
          <AppText variant="h1">Session Complete!</AppText>
          <AppText variant="body" color="textSecondary" align="center">
            You reviewed {cards.length} cards today.
          </AppText>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AppText variant="h2" color="primary">{masteredCount}</AppText>
              <AppText variant="caption">Mastered</AppText>
            </View>
            <View style={styles.statBox}>
              <AppText variant="h2" color="textSecondary">{cards.length - masteredCount}</AppText>
              <AppText variant="caption">To Review</AppText>
            </View>
          </View>
          <AppButton 
            label="Back to Explore" 
            onPress={() => onComplete(results)} 
            style={styles.doneButton}
          />
        </AppGlassView>
      </View>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = (currentIndex + 1) / cards.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="label" color="textSecondary">
          Card {currentIndex + 1} of {cards.length}
        </AppText>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.cardWrapper}>
        <Flashcard 
          key={currentCard.id}
          card={currentCard} 
          onDifficultySelect={handleDifficultySelect} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.four,
  },
  header: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  resultsCard: {
    width: '100%',
    padding: Spacing.eight,
    alignItems: 'center',
    gap: Spacing.six,
    borderRadius: Radius.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.eight,
    marginVertical: Spacing.four,
  },
  statBox: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  doneButton: {
    width: '100%',
    marginTop: Spacing.two,
  },
});

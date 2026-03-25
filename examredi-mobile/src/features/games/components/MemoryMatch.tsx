import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Pressable, Dimensions, Alert } from 'react-native';
import { AppText, AppGlassView, AppButton } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const CARD_GAP = Spacing.two;
const CARD_SIZE = (width - Spacing.eight - (GRID_SIZE - 1) * CARD_GAP) / GRID_SIZE;

interface GameCard {
  id: string;
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MOCK_DATA = [
  { term: 'Photosynthesis', definition: 'Plants making food' },
  { term: 'Osmosis', definition: 'Water movement' },
  { term: 'Nucleus', definition: 'Cell control center' },
  { term: 'Gravity', definition: 'Force of attraction' },
  { term: 'Atom', definition: 'Smallest unit of matter' },
  { term: 'Evolution', definition: 'Change over time' },
  { term: 'DNA', definition: 'Genetic blueprint' },
  { term: 'Enzyme', definition: 'Biological catalyst' },
];

export function MemoryMatch() {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = useCallback(() => {
    const gameCards: GameCard[] = [];
    MOCK_DATA.forEach((data, index) => {
      // Add term card
      gameCards.push({
        id: `term-${index}`,
        content: data.term,
        pairId: `pair-${index}`,
        isFlipped: false,
        isMatched: false,
      });
      // Add definition card
      gameCards.push({
        id: `def-${index}`,
        content: data.definition,
        pairId: `pair-${index}`,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(gameCards.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardPress = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlipped;
      
      if (cards[firstIndex].pairId === cards[secondIndex].pairId) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
          
          if (matches + 1 === MOCK_DATA.length) {
            setIsGameOver(true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  if (isGameOver) {
    return (
      <View style={styles.gameOver}>
        <AppGlassView intensity={20} style={styles.gameOverCard}>
          <AppText variant="h1">Well Done! 🎉</AppText>
          <AppText variant="body" color="textSecondary">You cleared the board in {moves} moves.</AppText>
          <AppButton label="Play Again" onPress={initGame} style={styles.restartButton} />
        </AppGlassView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <AppText variant="caption" color="textSecondary">Moves</AppText>
          <AppText variant="h3">{moves}</AppText>
        </View>
        <View style={styles.stat}>
          <AppText variant="caption" color="textSecondary">Matches</AppText>
          <AppText variant="h3">{matches}/{MOCK_DATA.length}</AppText>
        </View>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <Pressable 
            key={card.id} 
            onPress={() => handleCardPress(index)}
            disabled={card.isMatched}
          >
            <AppGlassView 
              intensity={card.isFlipped || card.isMatched ? 30 : 5}
              style={[
                styles.card,
                card.isMatched && styles.matchedCard,
                card.isFlipped && styles.flippedCard
              ]}
            >
              {(card.isFlipped || card.isMatched) ? (
                <AppText 
                  variant="caption" 
                  align="center" 
                  style={styles.cardText}
                  numberOfLines={3}
                >
                  {card.content}
                </AppText>
              ) : (
                <AppText variant="h2" color="primary">?</AppText>
              )}
            </AppGlassView>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.eight,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.four,
    borderRadius: Radius.lg,
  },
  stat: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'center',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  flippedCard: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  matchedCard: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    opacity: 0.8,
  },
  cardText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  gameOver: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  gameOverCard: {
    width: '100%',
    padding: Spacing.eight,
    alignItems: 'center',
    gap: Spacing.six,
    borderRadius: Radius.xxl,
  },
  restartButton: {
    width: '100%',
  },
});

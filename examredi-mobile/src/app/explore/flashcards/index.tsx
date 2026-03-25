import React from 'react';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/ui';
import { FlashcardDeck } from '@/features/flashcards/components/FlashcardDeck';
import { Flashcard } from '@/features/flashcards/types';

const MOCK_CARDS: Flashcard[] = [
  {
    id: '1',
    subject: 'Biology',
    question: 'What is the powerhouse of the cell?',
    answer: 'The Mitochondria is known as the powerhouse of the cell because it generates most of the cell\'s supply of adenosine triphosphate (ATP).',
  },
  {
    id: '2',
    subject: 'Physics',
    question: 'Define Newton\'s First Law of Motion.',
    answer: 'An object at rest remains at rest, and an object in motion remains in motion at constant speed and in a straight line unless acted on by an unbalanced force.',
  },
  {
    id: '3',
    subject: 'Chemistry',
    question: 'What is Avogadro\'s number?',
    answer: 'The number of elementary entities (usually atoms or molecules) in one mole of a substance: 6.022 x 10²³.',
  },
];

export default function FlashcardsScreen() {
  const router = useRouter();

  const handleComplete = (results: any) => {
    console.log('Flashcard session complete:', results);
    router.back();
  };

  return (
    <AppScreen>
      <FlashcardDeck cards={MOCK_CARDS} onComplete={handleComplete} />
    </AppScreen>
  );
}

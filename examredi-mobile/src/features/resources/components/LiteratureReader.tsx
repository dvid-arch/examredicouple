import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { AppText, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';

const MOCK_BOOKS = [
  { 
    id: '1', 
    title: 'The Life Changer', 
    author: 'Khader Ismail', 
    description: 'The official UTME English literature text for 2021-2025.',
    chapters: [
      { id: 'c1', title: 'The University Environment', content: 'The university is a world of its own...' },
      { id: 'c2', title: 'The Social Life', content: 'Friendships in the university are often fleeting...' },
    ]
  },
  { 
    id: '2', 
    title: 'Sweeethere', 
    author: 'T.J.S George', 
    description: 'A study of themes and characters.',
    chapters: [
      { id: 'c1', title: 'Introduction', content: 'Sweeethere explores the journey of...' },
    ]
  },
];

export function LiteratureReader() {
  const [selectedBook, setSelectedBook] = useState<typeof MOCK_BOOKS[0] | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<typeof MOCK_BOOKS[0]['chapters'][0] | null>(null);

  if (selectedChapter) {
    return (
      <View style={styles.readerContainer}>
        <View style={styles.readerHeader}>
          <Pressable onPress={() => setSelectedChapter(null)} style={styles.backButton}>
            <AppText variant="bodyBold">← Back</AppText>
          </Pressable>
          <View>
            <AppText variant="h3">{selectedChapter.title}</AppText>
            <AppText variant="caption" color="textSecondary">{selectedBook?.title}</AppText>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.readContent}>
          <AppText variant="body" style={styles.textContent}>
            {selectedChapter.content}
          </AppText>
        </ScrollView>
      </View>
    );
  }

  if (selectedBook) {
    return (
      <View style={styles.bookDetails}>
        <Pressable onPress={() => setSelectedBook(null)} style={styles.backButton}>
          <AppText variant="bodyBold">← All Books</AppText>
        </Pressable>
        <View style={styles.bookHeader}>
          <AppText variant="h1">{selectedBook.title}</AppText>
          <AppText variant="body" color="primary">{selectedBook.author}</AppText>
        </View>
        <ScrollView style={styles.chaptersList}>
          {selectedBook.chapters.map(chapter => (
            <Pressable 
              key={chapter.id} 
              onPress={() => setSelectedChapter(chapter)}
              style={styles.chapterItem}
            >
              <AppGlassView intensity={5} style={styles.chapterCard}>
                <AppText variant="bodyBold">{chapter.title}</AppText>
                <AppText variant="caption" color="textSecondary">Read Chapter</AppText>
              </AppGlassView>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {MOCK_BOOKS.map(book => (
        <Pressable key={book.id} onPress={() => setSelectedBook(book)} style={styles.bookItem}>
          <AppGlassView intensity={10} style={styles.bookCard}>
            <View style={styles.bookCover}>
              <AppText variant="h1">📖</AppText>
            </View>
            <View style={styles.bookInfo}>
              <AppText variant="h3">{book.title}</AppText>
              <AppText variant="caption" color="textSecondary">{book.author}</AppText>
              <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.bookDesc}>
                {book.description}
              </AppText>
            </View>
          </AppGlassView>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  bookItem: {
    width: '100%',
  },
  bookCard: {
    flexDirection: 'row',
    padding: Spacing.four,
    gap: Spacing.four,
    borderRadius: Radius.xl,
  },
  bookCover: {
    width: 80,
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    gap: 4,
  },
  bookDesc: {
    marginTop: Spacing.two,
  },
  bookDetails: {
    flex: 1,
    padding: Spacing.four,
  },
  backButton: {
    marginBottom: Spacing.six,
  },
  bookHeader: {
    marginBottom: Spacing.eight,
  },
  chaptersList: {
    gap: Spacing.three,
  },
  chapterItem: {
    marginBottom: Spacing.two,
  },
  chapterCard: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readerContainer: {
    flex: 1,
  },
  readerHeader: {
    padding: Spacing.four,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: Spacing.four,
  },
  readContent: {
    padding: Spacing.six,
  },
  textContent: {
    lineHeight: 28,
  },
});

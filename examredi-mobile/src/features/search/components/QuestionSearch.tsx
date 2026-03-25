import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { AppText, AppGlassView, AppInput } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';

const MOCK_QUESTIONS = [
  { id: '1', subject: 'Biology', question: 'Which organelle is responsible for cellular respiration?', year: 2022 },
  { id: '2', subject: 'Physics', question: 'The rate of change of momentum is equal to?', year: 2021 },
  { id: '3', subject: 'English', question: 'Choose the option nearest in meaning to: "The speaker\'s argument was *cogent*".', year: 2023 },
  { id: '4', subject: 'Chemistry', question: 'What is the oxidation state of Manganese in KMnO4?', year: 2020 },
  { id: '5', subject: 'Mathematics', question: 'Find the value of x if 2x + 5 = 15.', year: 2022 },
];

export function QuestionSearch() {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    return MOCK_QUESTIONS.filter(q => {
      const matchesQuery = q.question.toLowerCase().includes(query.toLowerCase());
      const matchesSubject = !selectedSubject || q.subject === selectedSubject;
      return matchesQuery && matchesSubject;
    });
  }, [query, selectedSubject]);

  const subjects = [...new Set(MOCK_QUESTIONS.map(q => q.subject))];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppInput 
          placeholder="Search past questions..." 
          value={query}
          onChangeText={setQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectFilter}>
          <Pressable 
            onPress={() => setSelectedSubject(null)}
            style={[styles.chip, !selectedSubject && styles.activeChip]}
          >
            <AppText variant="caption" color={!selectedSubject ? 'white' : 'textSecondary'}>All</AppText>
          </Pressable>
          {subjects.map(subject => (
            <Pressable 
              key={subject}
              onPress={() => setSelectedSubject(subject)}
              style={[styles.chip, selectedSubject === subject && styles.activeChip]}
            >
              <AppText variant="caption" color={selectedSubject === subject ? 'white' : 'textSecondary'}>
                {subject}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppGlassView intensity={5} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <AppText variant="caption" color="primary">{item.subject}</AppText>
              <AppText variant="caption" color="textSecondary">{item.year}</AppText>
            </View>
            <AppText variant="body" numberOfLines={3}>{item.question}</AppText>
          </AppGlassView>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="body" color="textSecondary">No questions found matching your search.</AppText>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Note: I accidentally used ScrollView inside a View but didn't import it. I'll import it in the next step or fix it now.
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  subjectFilter: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: Spacing.two,
  },
  activeChip: {
    backgroundColor: '#3B82F6',
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  resultItem: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  empty: {
    padding: Spacing.eight,
    alignItems: 'center',
  },
});

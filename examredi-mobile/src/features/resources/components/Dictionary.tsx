import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { AppText, AppGlassView, AppInput } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';

const MOCK_TERMS = [
  { term: 'Photosynthesis', definition: 'The process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water.' },
  { term: 'Osmosis', definition: 'A process by which molecules of a solvent tend to pass through a semipermeable membrane from a less concentrated solution into a more concentrated one.' },
  { term: 'Isotope', definition: 'Each of two or more forms of the same element that contain equal numbers of protons but different numbers of neutrons in their nuclei.' },
  { term: 'Metaphor', definition: 'A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable.' },
  { term: 'Quantum', definition: 'A discrete quantity of energy proportional in magnitude to the frequency of the radiation it represents.' },
];

export function Dictionary() {
  const [query, setQuery] = useState('');

  const filteredTerms = useMemo(() => {
    return MOCK_TERMS.filter(t => 
      t.term.toLowerCase().includes(query.toLowerCase()) || 
      t.definition.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppInput 
          placeholder="Search terms and definitions..." 
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filteredTerms}
        keyExtractor={item => item.term}
        renderItem={({ item }) => (
          <AppGlassView intensity={5} style={styles.termItem}>
            <AppText variant="h3" color="primary">{item.term}</AppText>
            <AppText variant="body" style={styles.definitionText}>{item.definition}</AppText>
          </AppGlassView>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="body" color="textSecondary">No terms found matching your search.</AppText>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.four,
  },
  listContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  termItem: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  definitionText: {
    lineHeight: 22,
  },
  empty: {
    padding: Spacing.eight,
    alignItems: 'center',
  },
});

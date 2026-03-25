import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, AppText, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';

const TOOLS = [
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Master concepts with active recall.',
    icon: '🎴',
    color: '#3B82F6',
    route: '/explore/flashcards',
  },
  {
    id: 'games',
    title: 'Educational Games',
    description: 'Learn while having fun.',
    icon: '🎮',
    color: '#F59E0B',
    route: '/explore/games',
  },
  {
    id: 'search',
    title: 'Question Search',
    description: 'Find any past question instantly.',
    icon: '🔍',
    color: '#10B981',
    route: '/explore/search',
  },
  {
    id: 'literature',
    title: 'UTME Literature',
    description: 'Review official books and themes.',
    icon: '📚',
    color: '#8B5CF6',
    route: '/explore/literature',
  },
  {
    id: 'dictionary',
    title: 'Dictionary',
    description: 'Quick lookup for key terms.',
    icon: '📖',
    color: '#EC4899',
    route: '/explore/dictionary',
  },
];

export function ExploreScreen() {
  const router = useRouter();

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="h1">Explore</AppText>
          <AppText variant="body" color="textSecondary">
            Supercharge your study with specialized tools.
          </AppText>
        </View>

        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <Pressable 
              key={tool.id} 
              onPress={() => router.push(tool.route as any)}
              style={styles.tileWrapper}
            >
              <AppGlassView intensity={10} style={styles.tile}>
                <View style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}>
                  <AppText variant="h2">{tool.icon}</AppText>
                </View>
                <View style={styles.tileText}>
                  <AppText variant="bodyBold">{tool.title}</AppText>
                  <AppText variant="caption" color="textSecondary" numberOfLines={2}>
                    {tool.description}
                  </AppText>
                </View>
              </AppGlassView>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.eight,
  },
  header: {
    marginBottom: Spacing.six,
  },
  grid: {
    gap: Spacing.four,
  },
  tileWrapper: {
    width: '100%',
  },
  tile: {
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    borderRadius: Radius.xl,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    flex: 1,
    gap: 2,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { AppCard } from '@/components/ui/app-card';

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  checkpoints: string[];
};

export function FeaturePlaceholder({
  title,
  description,
  checkpoints,
}: FeaturePlaceholderProps) {
  return (
    <AppCard>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>
        {description}
      </ThemedText>

      <View style={styles.checkpointList}>
        {checkpoints.map((checkpoint) => (
          <View key={checkpoint} style={styles.row}>
            <View style={styles.dot} />
            <ThemedText
              type="caption"
              themeColor="textSecondary"
              style={styles.rowText}
            >
              {checkpoint}
            </ThemedText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  description: {
    marginTop: Spacing.one,
  },
  checkpointList: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  dot: {
    marginTop: 6,
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: '#1A73E8',
  },
  rowText: {
    flex: 1,
  },
});

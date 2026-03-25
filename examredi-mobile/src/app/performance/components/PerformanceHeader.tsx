import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';

export function PerformanceHeader() {
  return (
    <View style={styles.container}>
      <AppText variant="h2">Performance Analytics</AppText>
      <AppText variant="body" color="textSecondary" style={styles.caption}>
        Track your progress and identify areas for improvement.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.six,
  },
  caption: {
    marginTop: Spacing.one,
    lineHeight: 20,
  },
});

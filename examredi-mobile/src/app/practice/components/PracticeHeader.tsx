import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';

export function PracticeHeader() {
  return (
    <View style={styles.container}>
      <AppText variant="h1">Practice</AppText>
      <AppText variant="body" color="textSecondary">
        Configure your custom UTME session.
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

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function QuickActions() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="label" color="textSecondary" style={styles.title}>
        Quick Actions
      </AppText>
      <View style={styles.grid}>
        <AppButton
          label="Practice"
          variant="glass"
          onPress={() => router.push('/practice')}
          style={styles.actionButton}
        />
        <AppButton
          label="Analytics"
          variant="glass"
          onPress={() => router.push('/performance')}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.six,
  },
  title: {
    marginBottom: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minHeight: 64,
  },
});

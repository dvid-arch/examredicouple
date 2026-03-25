import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Spacing } from '@/constants/theme';

interface DashboardHeaderProps {
  userName: string;
  greeting: string;
}

export function DashboardHeader({ userName, greeting }: DashboardHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label" color="textSecondary">
        {greeting}
      </AppText>
      <AppText variant="h2" style={styles.userName}>
        {userName}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  userName: {
    marginTop: Spacing.half,
  },
});

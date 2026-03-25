import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, AppGlassView } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  role: string;
}

export function ProfileHeader({ fullName, email, role }: ProfileHeaderProps) {
  const theme = useTheme();
  
  return (
    <AppGlassView intensity={15} style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
        <AppText variant="h2" color="primary">
          {fullName.charAt(0).toUpperCase()}
        </AppText>
      </View>
      <View style={styles.info}>
        <AppText variant="h3">{fullName}</AppText>
        <AppText variant="caption" color="textSecondary">{email}</AppText>
        <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
          <AppText variant="label" style={styles.badgeText}>{role.toUpperCase()}</AppText>
        </View>
      </View>
    </AppGlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.six,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: Spacing.quarter,
  },
  badge: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
});

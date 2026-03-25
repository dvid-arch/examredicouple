import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { AppButton, AppCard } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

type AuthRequiredProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthRequired({
  title,
  description,
  children,
}: AuthRequiredProps) {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <AppCard>
        <ThemedText type="smallBold">Preparing your session...</ThemedText>
        <ThemedText style={styles.cardBody} themeColor="textSecondary">
          Restoring your account state.
        </ThemedText>
      </AppCard>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppCard>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText style={styles.cardBody} themeColor="textSecondary">
          {description}
        </ThemedText>
        <View style={styles.actions}>
          <AppButton
            label="Sign in to continue"
            onPress={() => router.push('/auth')}
          />
        </View>
      </AppCard>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  cardBody: {
    marginTop: Spacing.one,
  },
  actions: {
    marginTop: Spacing.three,
  },
});

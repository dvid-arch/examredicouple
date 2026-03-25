import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, AppCard, AppButton, AppGlassView } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';

export function ProfileCTA() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <AppGlassView intensity={10} style={styles.card}>
        <AppText variant="h3" style={styles.title}>Join the Community</AppText>
        <AppText color="textSecondary" style={styles.desc}>
          Sign in to sync your practice history, track your progress, and unlock personalised UTME preparation.
        </AppText>
        <AppButton label="Sign In" onPress={() => router.push('/auth')} style={styles.button} />
      </AppGlassView>

      <View style={styles.benefits}>
        <Benefit icon="📊" title="Track Progress" />
        <Benefit icon="🔄" title="Sync Sessions" />
        <Benefit icon="🏆" title="Leaderboards" />
      </View>
    </View>
  );
}

function Benefit({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.benefit}>
      <AppText style={styles.benefitIcon}>{icon}</AppText>
      <AppText variant="caption" color="textSecondary">{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  card: {
    padding: Spacing.six,
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  desc: {
    marginBottom: Spacing.five,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  benefits: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.two,
  },
  benefit: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  benefitIcon: {
    fontSize: 24,
  },
});

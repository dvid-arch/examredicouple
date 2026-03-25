import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton, AppCard, AppScreen } from '@/components/ui';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText type="subtitle">Profile</ThemedText>

        {isAuthenticated && user ? (
          <>
            {/* User Header */}
            <View
              style={[
                styles.userHeader,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarEmoji}>👤</ThemedText>
              </View>
              <View style={styles.userInfo}>
                <ThemedText type="subtitle">
                  {user.fullName ?? 'ExamRedi Scholar'}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  {user.email}
                </ThemedText>
                <View style={styles.roleBadge}>
                  <ThemedText type="caption" style={styles.roleText}>
                    {user.role === 'admin' ? '👨‍💼' : '📚'}{' '}
                    {user.role.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                ⚙️ Account Settings
              </ThemedText>
              <MenuOption icon="📧" label="Email" value={user.email} />
              <MenuOption icon="🔑" label="Password" value="••••••••" />
              <MenuOption icon="🌐" label="Language" value="English" />
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                🎯 Preferences
              </ThemedText>
              <MenuOption icon="🌙" label="Dark Mode" value="Auto" />
              <MenuOption icon="📬" label="Notifications" value="Enabled" />
              <MenuOption icon="💾" label="Backup" value="Enabled" />
            </View>

            {/* Help & Support Section */}
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                💬 Help & Support
              </ThemedText>
              <MenuButton icon="📖" label="How to use ExamRedi" />
              <MenuButton icon="❓" label="FAQ" />
              <MenuButton icon="📧" label="Contact Support" />
            </View>

            {/* Logout */}
            <View style={styles.section}>
              <AppButton
                label="Log out"
                variant="outline"
                loading={isLoading}
                onPress={() => logout()}
                style={styles.logoutButton}
              />
            </View>
          </>
        ) : (
          <>
            {/* Sign In Prompt */}
            <AppCard>
              <ThemedText type="smallBold">👋 Welcome to ExamRedi</ThemedText>
              <ThemedText
                style={styles.ctaDescription}
                themeColor="textSecondary"
              >
                Sign in to sync your practice history, track your progress, and
                unlock personalised UTME preparation.
              </ThemedText>
              <AppButton label="Sign in" onPress={() => router.push('/auth')} />
            </AppCard>

            {/* Info Cards */}
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                ✨ Why Sign In?
              </ThemedText>
              <InfoCard icon="📊" title="Track Progress" value="3 benefits" />
              <InfoCard icon="🔄" title="Sync Sessions" value="3 benefits" />
              <InfoCard icon="🏆" title="Leaderboards" value="Coming soon" />
            </View>

            {/* Help Links */}
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                💬 Support
              </ThemedText>
              <MenuButton icon="📖" label="How to use ExamRedi" />
              <MenuButton icon="❓" label="FAQ" />
            </View>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

function MenuOption({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <Pressable style={styles.menuOptionPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.menuOption,
            {
              backgroundColor: pressed
                ? theme.backgroundSelected
                : 'transparent',
            },
          ]}
        >
          <View style={styles.menuLeft}>
            <ThemedText style={styles.optionIcon}>{icon}</ThemedText>
            <ThemedText type="caption">{label}</ThemedText>
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            {value}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function MenuButton({ icon, label }: { icon: string; label: string }) {
  const theme = useTheme();
  return (
    <Pressable style={styles.menuOptionPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.menuOption,
            {
              backgroundColor: pressed
                ? theme.backgroundSelected
                : 'transparent',
            },
          ]}
        >
          <View style={styles.menuLeft}>
            <ThemedText style={styles.optionIcon}>{icon}</ThemedText>
            <ThemedText type="caption">{label}</ThemedText>
          </View>
          <ThemedText style={styles.chevron}>›</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <AppCard style={styles.infoCard}>
      <View style={styles.infoContent}>
        <ThemedText style={styles.infoIcon}>{icon}</ThemedText>
        <View style={styles.infoText}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {value}
          </ThemedText>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.four,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  roleBadge: {
    marginTop: Spacing.one,
  },
  roleText: {
    fontWeight: '600',
    fontSize: 11,
  },
  section: {
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuOptionPress: {
    borderRadius: Radius.md,
  },
  menuOption: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  menuLeft: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 18,
  },
  chevron: {
    fontSize: 20,
  },
  infoCard: {
    marginBottom: Spacing.two,
  },
  infoContent: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    gap: Spacing.half,
  },
  ctaDescription: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: Spacing.two,
  },
});

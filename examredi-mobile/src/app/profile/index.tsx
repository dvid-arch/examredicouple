import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen, AppText, AppButton } from '@/components/ui';
import { Spacing } from '@/constants/theme';

import { useProfileData } from './hooks/useProfileData';
import { ProfileHeader } from './components/ProfileHeader';
import { MenuSection } from './components/MenuSection';
import { ProfileCTA } from './components/ProfileCTA';

export default function ProfileScreen() {
  const { isAuthenticated, user, handleLogout, isLoading } = useProfileData();

  return (
    <AppScreen>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AppText variant="h2" style={styles.title}>Profile</AppText>

        {isAuthenticated && user ? (
          <>
            <ProfileHeader 
              fullName={user.fullName || 'ExamRedi Scholar'} 
              email={user.email} 
              role={user.role} 
            />

            <MenuSection 
              title="Account Settings" 
              items={[
                { icon: '📧', label: 'Email', value: user.email },
                { icon: '🔑', label: 'Password', value: '••••••••' },
                { icon: '🌐', label: 'Language', value: 'English' },
              ]}
            />

            <MenuSection 
              title="Preferences" 
              items={[
                { icon: '🌙', label: 'Dark Mode', value: 'Auto' },
                { icon: '📬', label: 'Notifications', value: 'Enabled' },
              ]}
            />

            <MenuSection 
              title="Help & Support" 
              items={[
                { icon: '📖', label: 'How to use ExamRedi' },
                { icon: '❓', label: 'FAQ' },
                { icon: '📧', label: 'Contact Support' },
              ]}
            />

            <AppButton 
              label="Log Out" 
              variant="outline" 
              onPress={handleLogout} 
              loading={isLoading}
              style={styles.logout}
            />
          </>
        ) : (
          <ProfileCTA />
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  title: {
    marginBottom: Spacing.four,
  },
  logout: {
    marginTop: Spacing.two,
  },
});

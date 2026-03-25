import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';

export function useProfileData() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    handleLogout,
    router,
  };
}

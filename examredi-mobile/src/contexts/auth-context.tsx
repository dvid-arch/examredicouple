import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { apiClient, setSessionExpiredHandler } from '@/services/api-client';
import { sessionStorageService } from '@/services/session-storage';
import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '@/types/auth';

type AuthContextValue = {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(): Promise<AuthUser> {
  return apiClient<AuthUser>('/auth/profile');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const handleSessionExpired = useCallback(() => {
    void sessionStorageService.clearAuth();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await fetchProfile();
    setUser(profile);
    await sessionStorageService.saveUser(profile);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
    return () => {
      setSessionExpiredHandler(null);
    };
  }, [handleSessionExpired]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await sessionStorageService.init();

      const cachedUser = sessionStorageService.getUser();
      const cachedTokens = sessionStorageService.getTokens();

      if (isMounted && cachedUser) {
        setUser(cachedUser);
      }

      if (!cachedTokens) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const profile = await fetchProfile();

        if (isMounted) {
          setUser(profile);
          await sessionStorageService.saveUser(profile);
        }
      } catch {
        if (isMounted) {
          await sessionStorageService.clearAuth();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);

    try {
      const auth = await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: payload,
        useAuth: false,
      });
      await sessionStorageService.saveTokens(auth);
      const profile = await fetchProfile();
      await sessionStorageService.saveUser(profile);
      setUser(profile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);

    try {
      const auth = await apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: payload,
        useAuth: false,
      });

      await sessionStorageService.saveTokens(auth);
      const profile = await fetchProfile();
      await sessionStorageService.saveUser(profile);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Clear local auth state even when the backend revoke call fails.
    } finally {
      await sessionStorageService.clearAuth();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [isBootstrapping, isLoading, login, logout, refreshProfile, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

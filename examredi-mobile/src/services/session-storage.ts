import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AuthTokens, AuthUser } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'examredi.auth.accessToken';
const REFRESH_TOKEN_KEY = 'examredi.auth.refreshToken';
const USER_KEY = 'examredi.auth.user';

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memoryStore = new Map<string, string>();

const fallbackStore: KeyValueStore = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

const getWebStore = (): KeyValueStore => {
  if (typeof globalThis.localStorage !== 'undefined') {
    return globalThis.localStorage;
  }

  return fallbackStore;
};

const webStore = getWebStore();
const isWeb = Platform.OS === 'web';

let hasHydrated = false;
let hydrationPromise: Promise<void> | null = null;

const sessionCache: {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
} = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const readPersistedValue = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return webStore.getItem(key);
  }

  return SecureStore.getItemAsync(key);
};

const writePersistedValue = async (
  key: string,
  value: string,
): Promise<void> => {
  if (isWeb) {
    webStore.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const removePersistedValue = async (key: string): Promise<void> => {
  if (isWeb) {
    webStore.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

const safeParseJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const sessionStorageService = {
  async init(): Promise<void> {
    if (hasHydrated) {
      return;
    }

    if (hydrationPromise) {
      await hydrationPromise;
      return;
    }

    hydrationPromise = (async () => {
      const [accessToken, refreshToken, rawUser] = await Promise.all([
        readPersistedValue(ACCESS_TOKEN_KEY),
        readPersistedValue(REFRESH_TOKEN_KEY),
        readPersistedValue(USER_KEY),
      ]);

      sessionCache.accessToken = accessToken;
      sessionCache.refreshToken = refreshToken;
      sessionCache.user = safeParseJson<AuthUser>(rawUser);
      hasHydrated = true;
    })();

    try {
      await hydrationPromise;
    } finally {
      hydrationPromise = null;
    }
  },

  getAccessToken(): string | null {
    return sessionCache.accessToken;
  },

  getRefreshToken(): string | null {
    return sessionCache.refreshToken;
  },

  getUser(): AuthUser | null {
    return sessionCache.user;
  },

  getTokens(): AuthTokens | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },

  async saveTokens(tokens: AuthTokens): Promise<void> {
    sessionCache.accessToken = tokens.accessToken;
    sessionCache.refreshToken = tokens.refreshToken;
    hasHydrated = true;

    await Promise.all([
      writePersistedValue(ACCESS_TOKEN_KEY, tokens.accessToken),
      writePersistedValue(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  },

  async saveUser(user: AuthUser): Promise<void> {
    sessionCache.user = user;
    hasHydrated = true;
    await writePersistedValue(USER_KEY, JSON.stringify(user));
  },

  async clearAuth(): Promise<void> {
    sessionCache.accessToken = null;
    sessionCache.refreshToken = null;
    sessionCache.user = null;
    hasHydrated = true;

    await Promise.all([
      removePersistedValue(ACCESS_TOKEN_KEY),
      removePersistedValue(REFRESH_TOKEN_KEY),
      removePersistedValue(USER_KEY),
    ]);
  },
};

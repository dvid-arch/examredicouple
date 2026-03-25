import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { defaultPracticeDraft, PracticeSetupDraft } from '@/types/practice';

const PRACTICE_SETUP_KEY = 'examredi.practice.setup';

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

const isValidDraft = (value: unknown): value is PracticeSetupDraft => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    (draft.mode === 'study' ||
      draft.mode === 'practice' ||
      draft.mode === 'mock') &&
    Array.isArray(draft.subjects) &&
    typeof draft.fromYear === 'string' &&
    typeof draft.toYear === 'string' &&
    typeof draft.durationMinutes === 'string'
  );
};

export const practiceSetupStorage = {
  async getDraft(): Promise<PracticeSetupDraft> {
    const raw = await readPersistedValue(PRACTICE_SETUP_KEY);

    if (!raw) {
      return defaultPracticeDraft;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      return isValidDraft(parsed) ? parsed : defaultPracticeDraft;
    } catch {
      return defaultPracticeDraft;
    }
  },

  async saveDraft(draft: PracticeSetupDraft): Promise<void> {
    await writePersistedValue(PRACTICE_SETUP_KEY, JSON.stringify(draft));
  },
};

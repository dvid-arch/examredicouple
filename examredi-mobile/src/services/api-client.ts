import { API_BASE_URL } from '@/constants/api';
import { sessionStorageService } from '@/services/session-storage';
import { AuthResponse } from '@/types/auth';

type ApiHeaders = Record<string, string>;

type ApiRequestOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: ApiHeaders;
  body?: unknown;
  useAuth?: boolean;
  timeoutMs?: number;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
let onSessionExpired: (() => void) | null = null;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((entry) => {
    if (error) {
      entry.reject(error);
      return;
    }

    if (token) {
      entry.resolve(token);
      return;
    }

    entry.reject(new Error('Session refresh failed.'));
  });

  failedQueue = [];
};

const resolveUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
    };

    if (payload.message) {
      return payload.error
        ? `${payload.message} (${payload.error})`
        : payload.message;
    }
  } catch {
    // No-op: fall through to status text.
  }

  return response.statusText || 'Unexpected API error.';
};

const refreshSession = async (): Promise<string> => {
  await sessionStorageService.init();
  const refreshToken = sessionStorageService.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await fetch(resolveUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const tokens = (await response.json()) as AuthResponse;

  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error('Invalid token refresh response.');
  }

  await sessionStorageService.saveTokens(tokens);

  return tokens.accessToken;
};

const buildHeaders = async (
  headers: ApiHeaders,
  useAuth: boolean,
  tokenOverride?: string,
) => {
  const nextHeaders: ApiHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (useAuth) {
    const token = tokenOverride ?? sessionStorageService.getAccessToken();

    if (token) {
      nextHeaders.Authorization = `Bearer ${token}`;
    }
  }

  return nextHeaders;
};

const executeRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  isRetry = false,
  tokenOverride?: string,
): Promise<T> => {
  const {
    body,
    headers = {},
    useAuth = true,
    timeoutMs = 30_000,
    ...restOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (useAuth) {
      await sessionStorageService.init();
    }

    const response = await fetch(resolveUrl(endpoint), {
      ...restOptions,
      headers: await buildHeaders(headers, useAuth, tokenOverride),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (
      response.status === 401 &&
      useAuth &&
      !isRetry &&
      endpoint !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({
            resolve: (nextToken) => {
              resolve(executeRequest<T>(endpoint, options, true, nextToken));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const nextToken = await refreshSession();
        processQueue(null, nextToken);
        return executeRequest<T>(endpoint, options, true, nextToken);
      } catch (error) {
        processQueue(error, null);
        await sessionStorageService.clearAuth();
        onSessionExpired?.();
        throw error;
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if ((error as { name?: string }).name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

export const apiClient = executeRequest;

const FALLBACK_API_BASE_URL = 'https://examredi-backend.onrender.com/api';

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const normalizeApiBaseUrl = (candidate: string): string => {
  const withoutTrailingSlash = candidate.endsWith('/')
    ? candidate.slice(0, -1)
    : candidate;

  if (withoutTrailingSlash.startsWith('http')) {
    return withoutTrailingSlash.endsWith('/api')
      ? withoutTrailingSlash
      : `${withoutTrailingSlash}/api`;
  }

  return withoutTrailingSlash;
};

export const API_BASE_URL = normalizeApiBaseUrl(
  rawApiBaseUrl && rawApiBaseUrl.length > 0
    ? rawApiBaseUrl
    : FALLBACK_API_BASE_URL,
);

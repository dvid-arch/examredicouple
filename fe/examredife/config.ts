// In production, this should point to the Render backend.
// In development, it defaults to '/api' which is handled by the Vite proxy.
// In production, this should point to the Render backend.
// In development, it defaults to '/api' which is handled by the Vite proxy.
const rawBaseUrl = (import.meta as any).env.VITE_API_URL || '/api';

// Robust construction of API_BASE_URL
const cleanUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
export const API_BASE_URL = cleanUrl.startsWith('http')
    ? (cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`)
    : cleanUrl;

console.log(`[Config] API_BASE_URL initialized as: "${API_BASE_URL}"`);


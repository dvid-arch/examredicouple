// In production, this should point to the Render backend.
// In development, it defaults to '/api' which is handled by the Vite proxy.
// In production, this should point to the Render backend.
// In development, it defaults to '/api' which is handled by the Vite proxy.
const rawBaseUrl = (import.meta as any).env.VITE_API_URL || '/api';

// Robust construction of API_BASE_URL
export const API_BASE_URL = rawBaseUrl.startsWith('http') 
    ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`)
    : rawBaseUrl;

console.log(`[Config] API_BASE_URL initialized as: "${API_BASE_URL}"`);


export const API_CONFIG = {
  serverDomain: 'https://api.airbnbmob2.online',
  baseUrl: 'https://api.airbnbmob2.online/api',
};

export function formatImageUrl(url?: string | null): string {
  if (!url || !url.trim()) return '';

  const cleanUrl = url.trim();

  if (cleanUrl.includes('http://localhost:3001')) {
    return cleanUrl.replace('http://localhost:3001', API_CONFIG.serverDomain);
  }

  if (cleanUrl.includes('http://localhost')) {
    return cleanUrl.replace('http://localhost', API_CONFIG.serverDomain);
  }

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  return cleanUrl.startsWith('/')
    ? `${API_CONFIG.serverDomain}${cleanUrl}`
    : `${API_CONFIG.serverDomain}/${cleanUrl}`;
}
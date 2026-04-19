/**
 * API Client - Centralized HTTP client for all API calls.
 * 
 * Configure VITE_API_BASE_URL in your environment:
 *   - Development: defaults to mock mode (no real API needed)
 *   - Production: set to your Vercel API base, e.g. https://your-app.vercel.app/api
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = !API_BASE_URL;

export { USE_MOCK };

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('sniplink_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(headers as Record<string, string>),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export function setAuthToken(token: string) {
  localStorage.setItem('sniplink_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('sniplink_token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('sniplink_token');
}

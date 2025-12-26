// API Client for Hotel Dashboard
// Centralized HTTP client with JWT token management

import { ApiError, AuthTokens } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'hotel_access_token';
const REFRESH_TOKEN_KEY = 'hotel_refresh_token';

// Token management
export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  
  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  hasTokens: (): boolean => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};

// Custom error class for API errors
export class ApiClientError extends Error {
  public status: number;
  public code?: string;
  public field?: string;

  constructor(message: string, status: number, code?: string, field?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

// Request interceptor to add auth headers
const getHeaders = (customHeaders?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = tokenStorage.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Response handler
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: ApiError = { detail: 'An error occurred' };
    
    try {
      errorData = await response.json();
    } catch {
      // Response might not be JSON
    }

    // Handle token expiration
    if (response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        tokenStorage.clearTokens();
        window.location.href = '/login';
      }
    }

    throw new ApiClientError(
      errorData.detail || 'Request failed',
      response.status,
      errorData.code,
      errorData.field
    );
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

// Token refresh logic
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const tryRefreshToken = async (): Promise<boolean> => {
  if (isRefreshing) {
    return refreshPromise!;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const tokens: AuthTokens = await response.json();
      tokenStorage.setTokens(tokens);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Main API client
export const apiClient = {
  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return handleResponse<T>(response);
  },
};

export default apiClient;

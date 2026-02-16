import { HttpClient, ApiResponse, RequestOptions, Environment } from './types';

// Fetch-based HTTP client for React Native
export class FetchHttpClient implements HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private getAuthHeaders: () => Record<string, string>;

  constructor(
    baseUrl: string,
    getAuthHeaders: () => Record<string, string> = () => ({}),
    defaultTimeout = 10000,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.getAuthHeaders = getAuthHeaders;
    this.defaultTimeout = defaultTimeout;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      const config: RequestInit = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);

      let responseData;
      const contentType = response.headers.get('content-type');

      try {
        // Only try to parse as JSON if the response has JSON content type
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // For non-JSON responses (like HTML error pages), get text
          const responseText = await response.text();
          responseData = { message: responseText || `HTTP ${response.status} Error` };
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as text response
        responseData = { message: `Failed to parse response: ${response.status}` };
      }

      if (!response.ok) {
        return {
          error: responseData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      return {
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('[API DEBUG] Network request failed');
      console.error('[API DEBUG] Error details:', error);
      console.error('[API DEBUG] Error type:', typeof error);
      console.error(
        '[API DEBUG] Error message:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      console.error(
        '[API DEBUG] Error stack:',
        error instanceof Error ? error.stack : 'No stack trace',
      );

      // Use console.warn for better visibility
      console.warn(
        `❌ [API] Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Environment detection utilities
export const detectEnvironment = (): Environment => {
  // Check for Expo environment first (most specific)
  if (typeof global !== 'undefined' && (global as any).expo) {
    const isDev = typeof global !== 'undefined' && (global as any).__DEV__ === true;
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Check if we're in React Native (fallback for non-Expo RN)
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    const isDev = typeof global !== 'undefined' && (global as any).__DEV__ === true;
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Check for React Native by looking for global.__DEV__ (another indicator)
  if (typeof global !== 'undefined' && typeof (global as any).__DEV__ !== 'undefined') {
    const isDev = (global as any).__DEV__ === true;
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Additional check: if we have EXPO_PUBLIC_API_URL but no NEXT_PUBLIC_API_URL, assume mobile
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL) {
    const isDev = process.env.NODE_ENV === 'development';
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Check if we're in a browser
  if (typeof window !== 'undefined') {
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      platform: 'web',
    };
  }

  // Server environment
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    platform: 'server',
  };
};

// Base URL configuration helper
export const getApiBaseUrl = (overrideUrl?: string): string => {
  if (overrideUrl) {
    return overrideUrl;
  }

  const env = detectEnvironment();

  // Enhanced mobile detection with fallback to environment variables
  if (env.platform === 'mobile') {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('EXPO_PUBLIC_API_URL environment variable is required for mobile platform');
    }
    const result = `${baseUrl}/api`; // Add /api prefix for Payload CMS
    return result;
  }

  // Check for mobile environment variables even if platform detection failed
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL) {
    const result = `${process.env.EXPO_PUBLIC_API_URL}/api`;
    return result;
  }

  if (env.platform === 'web') {
    // Use relative path for web to leverage Next.js rewrites
    // This avoids CORS issues and allows the Next.js server to proxy requests
    return typeof window !== 'undefined' ? '/cms' : `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }

  // Server environment (Next.js SSR) - treat same as web
  if (env.platform === 'server') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required for server platform');
    }
    const result = `${baseUrl}/api`; // Add /api prefix for Payload CMS
    return result;
  }

  // Enhanced fallback - prefer mobile env var if available
  if (process.env.EXPO_PUBLIC_API_URL) {
    const fallbackResult = `${process.env.EXPO_PUBLIC_API_URL}/api`;
    return fallbackResult;
  }

  // Last resort - web environment variable
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error(
      'No API URL environment variable found. Please set EXPO_PUBLIC_API_URL for mobile or NEXT_PUBLIC_API_URL for web',
    );
  }
  const fallbackResult = `${baseUrl}/api`;
  return fallbackResult;
};

// Retry utility for failed requests
export const withRetry = async <T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<ApiResponse<T>> => {
  let lastError: ApiResponse<T>;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn();

      if (!result.error) {
        return result;
      }

      lastError = result;

      // Don't retry on client errors (4xx)
      if (result.status >= 400 && result.status < 500) {
        return result;
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    } catch (error) {
      lastError = {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  return lastError!;
};

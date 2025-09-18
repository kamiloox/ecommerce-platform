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
    console.log('🏗️ [API] Constructor called with baseUrl:', baseUrl);
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.getAuthHeaders = getAuthHeaders;
    this.defaultTimeout = defaultTimeout;
    console.log('🏗️ [API] Constructor finished, final baseUrl:', this.baseUrl);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    console.log('🔍 [API] Request method called with:', {
      method,
      endpoint,
      baseUrl: this.baseUrl,
    });

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      console.log('🔍 [API] Constructed URL:', url);
      console.log('🔍 [API] About to make fetch request...');

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

      // Enhanced debug logging - always show for debugging
      console.log(`[API DEBUG] Attempting ${method.toUpperCase()} request`);
      console.log(`[API DEBUG] Base URL: ${this.baseUrl}`);
      console.log(`[API DEBUG] Endpoint: ${endpoint}`);
      console.log(`[API DEBUG] Final URL: ${url}`);
      console.log(`[API DEBUG] Headers:`, JSON.stringify(headers, null, 2));
      console.log(`[API DEBUG] Config:`, JSON.stringify(config, null, 2));

      // Also try console.warn for better visibility
      console.warn(`🚀 [API] Making request to: ${url}`);

      const response = await fetch(url, config);

      console.log(`[API DEBUG] Response status: ${response.status}`);
      console.log(`[API DEBUG] Response headers:`, response.headers);

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
  // Add debug logging
  console.log('[detectEnvironment] DEBUG - typeof navigator:', typeof navigator);
  console.log('[detectEnvironment] DEBUG - navigator.product:', typeof navigator !== 'undefined' ? navigator.product : 'undefined');
  console.log('[detectEnvironment] DEBUG - typeof window:', typeof window);
  console.log('[detectEnvironment] DEBUG - typeof global:', typeof global);
  console.log('[detectEnvironment] DEBUG - process.env.NODE_ENV:', process.env.NODE_ENV);
  console.log('[detectEnvironment] DEBUG - process.env.EXPO_PUBLIC_API_URL:', !!process.env.EXPO_PUBLIC_API_URL);
  console.log('[detectEnvironment] DEBUG - process.env.NEXT_PUBLIC_API_URL:', !!process.env.NEXT_PUBLIC_API_URL);
  
  // Check for Expo environment first (most specific)
  if (typeof global !== 'undefined' && (global as any).expo) {
    console.log('[detectEnvironment] DEBUG - Detected Expo environment');
    const isDev = typeof global !== 'undefined' && (global as any).__DEV__ === true;
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Check if we're in React Native (fallback for non-Expo RN)
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    console.log('[detectEnvironment] DEBUG - Detected React Native environment');
    const isDev = typeof global !== 'undefined' && (global as any).__DEV__ === true;
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Check for React Native by looking for global.__DEV__ (another indicator)
  if (typeof global !== 'undefined' && typeof (global as any).__DEV__ !== 'undefined') {
    console.log('[detectEnvironment] DEBUG - Detected React Native via __DEV__');
    const isDev = (global as any).__DEV__ === true;
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Additional check: if we have EXPO_PUBLIC_API_URL but no NEXT_PUBLIC_API_URL, assume mobile
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL) {
    console.log('[detectEnvironment] DEBUG - Detected mobile via EXPO env var');
    const isDev = process.env.NODE_ENV === 'development';
    return {
      isDevelopment: isDev,
      isProduction: !isDev,
      platform: 'mobile',
    };
  }

  // Check if we're in a browser
  if (typeof window !== 'undefined') {
    console.log('[detectEnvironment] DEBUG - Detected browser environment');
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      platform: 'web',
    };
  }

  // Server environment
  console.log('[detectEnvironment] DEBUG - Defaulting to server environment');
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    platform: 'server',
  };
};

// Base URL configuration helper
export const getApiBaseUrl = (overrideUrl?: string): string => {
  console.log('🌐 [getApiBaseUrl DEBUG] Starting with overrideUrl:', overrideUrl);

  if (overrideUrl) {
    console.log('🌐 [getApiBaseUrl DEBUG] Using override URL:', overrideUrl);
    return overrideUrl;
  }

  const env = detectEnvironment();
  console.log('[getApiBaseUrl] Environment detected:', env);

  // Enhanced mobile detection with fallback to environment variables
  if (env.platform === 'mobile') {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('EXPO_PUBLIC_API_URL environment variable is required for mobile platform');
    }
    const result = `${baseUrl}/api`; // Add /api prefix for Payload CMS
    console.log('[getApiBaseUrl] Mobile result:', result);
    return result;
  }

  // Check for mobile environment variables even if platform detection failed
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL) {
    console.log('[getApiBaseUrl] Falling back to mobile based on EXPO env var');
    const result = `${process.env.EXPO_PUBLIC_API_URL}/api`;
    console.log('[getApiBaseUrl] Mobile fallback result:', result);
    return result;
  }

  if (env.platform === 'web') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required for web platform');
    }
    const result = `${baseUrl}/api`; // Add /api prefix for Payload CMS
    console.log('[getApiBaseUrl] Web result:', result);
    return result;
  }

  // Server environment (Next.js SSR) - treat same as web
  if (env.platform === 'server') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required for server platform');
    }
    const result = `${baseUrl}/api`; // Add /api prefix for Payload CMS
    console.log('[getApiBaseUrl] Server result:', result);
    return result;
  }

  // Enhanced fallback - prefer mobile env var if available
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('[getApiBaseUrl] Using EXPO env var as final fallback');
    const fallbackResult = `${process.env.EXPO_PUBLIC_API_URL}/api`;
    console.log('[getApiBaseUrl] Expo fallback result:', fallbackResult);
    return fallbackResult;
  }

  // Last resort - web environment variable
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('No API URL environment variable found. Please set EXPO_PUBLIC_API_URL for mobile or NEXT_PUBLIC_API_URL for web');
  }
  const fallbackResult = `${baseUrl}/api`;
  console.log('[getApiBaseUrl] Final fallback result:', fallbackResult);
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

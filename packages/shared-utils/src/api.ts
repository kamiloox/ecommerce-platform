import { HttpClient, ApiResponse, RequestOptions, Environment } from './types';

// Fetch-based HTTP client for React Native
export class FetchHttpClient implements HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private getAuthHeaders: () => Record<string, string>;

  constructor(
    baseUrl: string, 
    getAuthHeaders: () => Record<string, string> = () => ({}),
    defaultTimeout = 10000
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.getAuthHeaders = getAuthHeaders;
    this.defaultTimeout = defaultTimeout;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
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

      // Note: fetch doesn't support timeout directly in React Native
      // You might want to use a library like 'react-native-timeout' for timeout support
      
      // Debug logging for development
      if (process.env.NODE_ENV === 'development' || url.includes('localhost')) {
        console.log(`[API] ${method.toUpperCase()} ${url}`);
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
      console.error('HTTP request error:', error);
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
  // Check if we're in React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    const isDev = typeof global !== 'undefined' && (global as any).__DEV__ === true;
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
  if (overrideUrl) return overrideUrl;

  const env = detectEnvironment();
  console.log('[getApiBaseUrl] Environment detected:', env);
  
  if (env.platform === 'mobile') {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('EXPO_PUBLIC_API_URL environment variable is required for mobile platform');
    }
    const result = `${baseUrl}/api`; // Add /api prefix for Payload CMS
    console.log('[getApiBaseUrl] Mobile result:', result);
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

  // Fallback - require environment variable
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
  }
  const fallbackResult = `${baseUrl}/api`;
  console.log('[getApiBaseUrl] Fallback result:', fallbackResult);
  return fallbackResult;
};

// Retry utility for failed requests
export const withRetry = async <T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
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
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    } catch (error) {
      lastError = {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  return lastError!;
};

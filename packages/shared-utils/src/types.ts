// Import CMS types for better integration
import type { User, CurrentUser, ProductsQuery } from '@repo/cms-types';

// Common types for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  passwordConfirm?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  exp?: number;
}

// HTTP Client types
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpClient {
  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}

// Environment detection types
export interface Environment {
  isDevelopment: boolean;
  isProduction: boolean;
  platform: 'mobile' | 'web' | 'server';
}

// Cart item type for cart operations
export interface CartItem {
  product: number | any; // Product ID or Product object
  quantity: number;
  unitPrice: number;
  id?: string | null;
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}

// Re-export commonly used CMS types for convenience
export type { User, Product, Cart, CurrentUser, ProductsQuery, ProductsResult, Pagination } from '@repo/cms-types';

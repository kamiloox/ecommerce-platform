// Mobile API services setup using shared-utils
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '@repo/shared-utils/auth';
import { CartService } from '@repo/shared-utils/cart';
import { ProductsService } from '@repo/shared-utils/products';
import { FetchHttpClient } from '@repo/shared-utils/api';
import { MobileStorageAdapter, setDefaultStorage } from '@repo/shared-utils/storage';
import { API_BASE_URL } from '../api/config';

// Set up storage adapter for mobile
const mobileStorage = new MobileStorageAdapter(AsyncStorage);
setDefaultStorage(mobileStorage);

// Configure API base URL - uses environment detection
const baseUrl = API_BASE_URL;

// Create auth headers provider function
let authServiceInstance: AuthService | null = null;

const getAuthHeaders = (): Record<string, string> => {
  return authServiceInstance?.getAuthHeaders() || { 'Content-Type': 'application/json' };
};

// Create HTTP client with auth headers provider
const httpClient = new FetchHttpClient(baseUrl, getAuthHeaders);

// Create service instances with explicit types
export const authService: AuthService = new AuthService(httpClient, baseUrl, mobileStorage);
export const cartService: CartService = new CartService(httpClient, baseUrl);
export const productsService: ProductsService = new ProductsService(httpClient, baseUrl);

// Set the auth service instance reference for the headers provider
authServiceInstance = authService;

// Initialize auth service
authService.init();

// Export utility functions for convenience
export { 
  getProductImageUrl, 
  formatPrice, 
  calculateDiscountPercentage 
} from '@repo/shared-utils/products';

// Export types for convenience
export type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse
} from '@repo/shared-utils/types';

export type { ProductsParams } from '@repo/shared-utils/products';
export type { CartResponse } from '@repo/shared-utils/cart';

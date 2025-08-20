// Web API services setup using shared-utils
import { AuthService } from '@repo/shared-utils/auth';
import { CartService } from '@repo/shared-utils/cart';
import { ProductsService } from '@repo/shared-utils/products';
import { FetchHttpClient, getApiBaseUrl } from '@repo/shared-utils/api';
import { WebStorageAdapter, setDefaultStorage } from '@repo/shared-utils/storage';

// Set up storage adapter for web
const webStorage = new WebStorageAdapter();
setDefaultStorage(webStorage);

// Configure API base URL - uses environment detection
const baseUrl = getApiBaseUrl();

// Debug logging to see what URL we're actually using
console.log('[Web API Setup] Base URL:', baseUrl);

// Create HTTP client with properly typed auth headers function
const getAuthHeaders = (): Record<string, string> => {
  return authService?.getAuthHeaders() || { 'Content-Type': 'application/json' };
};

const httpClient = new FetchHttpClient(baseUrl, getAuthHeaders);

// Create service instances with explicit types to avoid circular references
export const authService: AuthService = new AuthService(httpClient, baseUrl, webStorage);
export const cartService: CartService = new CartService(httpClient, baseUrl);
export const productsService: ProductsService = new ProductsService(httpClient, baseUrl);

// Initialize auth service (only on client side)
if (typeof window !== 'undefined') {
  authService.init();
}

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

// Legacy API functions for easier migration
export const getProduct = async ({ slug }: { slug: string }) => {
  const response = await productsService.getProductBySlug(slug);
  return response.data;
};

export const getManyProducts = async ({ page = 1 }: { page?: number }) => {
  const response = await productsService.getProducts({ page });
  return response.data;
};

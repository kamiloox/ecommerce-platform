import { AuthService } from '@repo/shared-utils/auth';
import { CartService } from '@repo/shared-utils/cart';
import { ProductsService } from '@repo/shared-utils/products';
import { FetchHttpClient, getApiBaseUrl } from '@repo/shared-utils/api';
import { WebStorageAdapter, setDefaultStorage } from '@repo/shared-utils/storage';

const webStorage = new WebStorageAdapter();
setDefaultStorage(webStorage);

const baseUrl = getApiBaseUrl();

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
  calculateDiscountPercentage,
} from '@repo/shared-utils/products';

// Export types for convenience
export type { LoginCredentials, RegisterCredentials, AuthResponse } from '@repo/shared-utils/types';

export type { ProductsParams } from '@repo/shared-utils/products';
export type { CartResponse } from '@repo/shared-utils/cart';

// Legacy API functions for easier migration
export const getProduct = async ({ slug }: { slug: string }) => {
  const response = await productsService.getProductBySlug(slug);
  return response.data;
};

export const getManyProducts = async ({
  page = 1,
  sortBy,
  sortOrder,
}: {
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await productsService.getProducts({ page, sortBy, sortOrder });
  return response.data;
};

export const searchProducts = async ({
  query,
  page = 1,
  sortBy,
  sortOrder,
}: {
  query: string;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const response = await productsService.searchProducts(query, 20, page, sortBy, sortOrder);
  return response.data;
};

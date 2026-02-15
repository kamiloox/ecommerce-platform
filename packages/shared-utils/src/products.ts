import { Product, ProductsResult, ProductsQuery } from '@repo/cms-types';
import { HttpClient, ApiResponse } from './types';

export type ProductsParams = ProductsQuery & {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export class ProductsService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(httpClient: HttpClient, baseUrl: string) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async getProducts(params: ProductsParams = {}): Promise<ApiResponse<ProductsResult>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('where[status][equals]', params.status);
    if (params.featured !== undefined)
      searchParams.append('where[featured][equals]', params.featured.toString());
    if (params.category) searchParams.append('where[category][equals]', params.category);
    if (params.search) searchParams.append('where[name][contains]', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.httpClient.get<ProductsResult>(endpoint);
  }

  async getProductById(id: string | number): Promise<ApiResponse<Product>> {
    const response = await this.httpClient.get<ProductsResult>(`/products?where[id][equals]=${id}`);

    if (response.error) {
      return {
        error: response.error,
        status: response.status,
      };
    }

    const product = response.data?.docs[0];
    if (!product) {
      return {
        error: 'Product not found',
        status: 404,
      };
    }

    return {
      data: product,
      status: response.status,
    };
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    const response = await this.httpClient.get<ProductsResult>(
      `/products?where[slug][equals]=${slug}`,
    );

    if (response.error) {
      return {
        error: response.error,
        status: response.status,
      };
    }

    const product = response.data?.docs[0];
    if (!product) {
      return {
        error: 'Product not found',
        status: 404,
      };
    }

    return {
      data: product,
      status: response.status,
    };
  }

  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<ProductsResult>> {
    return this.getProducts({
      featured: true,
      limit,
      status: 'published',
    });
  }

  async searchProducts(
    query: string,
    limit: number = 20,
    page: number = 1,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Promise<ApiResponse<ProductsResult>> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('limit', limit.toString());
    searchParams.append('page', page.toString());
    if (sortBy) searchParams.append('sortBy', sortBy);
    if (sortOrder) searchParams.append('sortOrder', sortOrder);

    const endpoint = `/products/search?${searchParams.toString()}`;
    return this.httpClient.get<ProductsResult>(endpoint);
  }

  async getProductsByCategory(
    category: string,
    limit: number = 20,
  ): Promise<ApiResponse<ProductsResult>> {
    return this.getProducts({
      category,
      limit,
      status: 'published',
    });
  }
}

// Utility functions for products
export const getProductImageUrl = (product: Product, baseUrl?: string): string => {
  const base = baseUrl || '';

  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage && typeof firstImage === 'object' && firstImage.image) {
      if (typeof firstImage.image === 'object' && firstImage.image.url) {
        return `${base}${firstImage.image.url}`;
      }
    }
  }

  // Fallback to a placeholder image
  return `${base}/api/media/placeholder-product.jpg`;
};

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

export const calculateDiscountPercentage = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= 0 || salePrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const getProductStatus = (
  product: Product,
): 'available' | 'out-of-stock' | 'coming-soon' => {
  if (product.status !== 'published') return 'coming-soon';
  if (product.quantity && product.quantity <= 0) return 'out-of-stock';
  return 'available';
};

export const isProductOnSale = (product: Product): boolean => {
  return !!(product.compareAtPrice && product.price < product.compareAtPrice);
};

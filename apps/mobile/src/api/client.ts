import { Product, ProductsResult } from '@repo/cms-types';
import authService from './auth';

// Configuration
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.6:3000' // Your machine's IP address for development (backend port)
  : 'https://your-production-api.com'; // Replace with your production URL

// Alternative options if the above doesn't work:
// - Android emulator: 'http://10.0.2.2:3000'
// - iOS simulator: 'http://localhost:3000' might work
// - Physical device: Use your machine's IP address (192.168.0.6:3000)

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`🌐 API Request: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(authService.getToken() && { Authorization: `JWT ${authService.getToken()}` }),
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data);
        return {
          error: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      console.log(`✅ API Success:`, data);
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error(`🚨 Network Error:`, error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Products API
  async getProducts(
    params: {
      page?: number;
      limit?: number;
      status?: 'published' | 'draft' | 'archived';
      featured?: boolean;
    } = {},
  ): Promise<ApiResponse<ProductsResult>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('where[status][equals]', params.status);
    if (params.featured !== undefined)
      searchParams.append('where[featured][equals]', params.featured.toString());

    const queryString = searchParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

    return this.request<ProductsResult>(endpoint);
  }

  async getProductById(id: string | number): Promise<ApiResponse<Product>> {
    const response = await this.request<ProductsResult>(`/api/products?where[id][equals]=${id}`);

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
    const response = await this.request<ProductsResult>(
      `/api/products?where[slug][equals]=${slug}`,
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

  async getFeaturedProducts(): Promise<ApiResponse<ProductsResult>> {
    return this.getProducts({ featured: true }); // Removed status filter for development
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper function to get product image URL
export const getProductImageUrl = (product: Product): string => {
  // Check if product has images and get the first one
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage && firstImage.image && typeof firstImage.image === 'object') {
      const media = firstImage.image;
      if (media.url) {
        // If URL is relative, make it absolute
        if (media.url.startsWith('/')) {
          return `${API_BASE_URL}${media.url}`;
        }
        return media.url;
      }
    }
  }

  // Fallback to placeholder if no image
  return `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`;
};

export default apiClient;

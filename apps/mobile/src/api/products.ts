import { Product, ProductsResult } from '@repo/cms-types';
import { productsService as sharedProductsService } from '../services/api';

export interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
}

export interface ProductsService {
  getProducts: (params?: ProductsParams) => Promise<ProductsResult>;
  searchProducts: (params: {
    query: string;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<ProductsResult>;
  getProductById: (id: string | number) => Promise<Product | null>;
  getFeaturedProducts: () => Promise<Product[]>;
}

class ProductsServiceImpl implements ProductsService {
  async getProducts(params?: ProductsParams): Promise<ProductsResult> {
    try {
      const response = await sharedProductsService.getProducts({
        limit: params?.limit || 20,
        page: params?.page || 1,
        status: params?.status || 'published',
        featured: params?.featured,
        search: params?.search,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        ...params,
      });

      if (response.error) {
        console.error('Error fetching products:', response.error);
        return {
          docs: [],
          totalDocs: 0,
          limit: params?.limit || 20,
          totalPages: 0,
          page: params?.page || 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        };
      }

      return (
        response.data || {
          docs: [],
          totalDocs: 0,
          limit: params?.limit || 20,
          totalPages: 0,
          page: params?.page || 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        }
      );
    } catch (error) {
      console.error('Error in getProducts:', error);
      return {
        docs: [],
        totalDocs: 0,
        limit: params?.limit || 20,
        totalPages: 0,
        page: params?.page || 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };
    }
  }

  async searchProducts(params: {
    query: string;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResult> {
    try {
      const response = await sharedProductsService.searchProducts(
        params.query,
        20, // limit
        params.page || 1,
        params.sortBy,
        params.sortOrder,
      );

      if (response.error) {
        console.error('Error searching products:', response.error);
        return {
          docs: [],
          totalDocs: 0,
          limit: 20,
          totalPages: 0,
          page: params.page || 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        };
      }

      return (
        response.data || {
          docs: [],
          totalDocs: 0,
          limit: 20,
          totalPages: 0,
          page: params.page || 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        }
      );
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return {
        docs: [],
        totalDocs: 0,
        limit: 20,
        totalPages: 0,
        page: params.page || 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };
    }
  }

  async getProductById(id: string | number): Promise<Product | null> {
    try {
      const response = await sharedProductsService.getProductById(id);

      if (response.error) {
        console.error('Error fetching product by ID:', response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await sharedProductsService.getFeaturedProducts();

      if (response.error) {
        console.error('Error fetching featured products:', response.error);
        return [];
      }

      return response.data?.docs || [];
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return [];
    }
  }
}

export const productsService = new ProductsServiceImpl();
export default productsService;

import { Product } from '@repo/cms-types';
import { productsService as sharedProductsService } from '../services/api';

export interface ProductsService {
  getProducts: () => Promise<Product[]>;
  getProductById: (id: string | number) => Promise<Product | null>;
  getFeaturedProducts: () => Promise<Product[]>;
}

class ProductsServiceImpl implements ProductsService {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await sharedProductsService.getProducts({
        limit: 50, // Get more products for mobile display
        // Note: Removed status filter to show all products during development
        // Add back: status: 'published' for production
      });

      if (response.error) {
        console.error('Error fetching products:', response.error);
        return [];
      }

      return response.data?.docs || [];
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
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

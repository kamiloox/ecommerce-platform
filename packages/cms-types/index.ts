import { Product, User, Cart } from './types';
export * from './types';

export interface Pagination<T> {
  docs: Array<T>;
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export type ProductsResult = Pagination<Product>;

export type CurrentUser = {
  user: Pick<User, 'id' | 'email' | 'loginAttempts' | 'createdAt'>;
  token: string;
  exp: number;
};

// API-related types that extend CMS types
export interface CartWithItems extends Omit<Cart, 'items'> {
  items: Array<{
    id?: string | null;
    product: Product;
    quantity: number;
    unitPrice: number;
  }>;
}

// Query parameter types for API calls
export interface ProductsQuery {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
  category?: string;
  search?: string;
}

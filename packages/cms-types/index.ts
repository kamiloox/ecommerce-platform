import { Product } from './types';
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

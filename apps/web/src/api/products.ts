import wretch from 'wretch';
import { ProductsResult } from '@repo/cms-types'; // Import types as needed
import { getBaseUrl } from '@/utils/url';

export const getProduct = async ({ slug }: { slug: string }) => {
  const baseUrl = getBaseUrl();
  const result = await wretch(`${baseUrl}/cms/products?where[slug][equals]=${slug}`)
    .get()
    .json<ProductsResult>();

  return result.docs.at(0);
};

export const getManyProducts = async ({ page = 1 }: { page?: number }) => {
  const baseUrl = getBaseUrl();
  return wretch(`${baseUrl}/cms/products?page=${page}`).get().json<ProductsResult>();
};

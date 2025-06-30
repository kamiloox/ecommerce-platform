import React from 'react';
import wretch from 'wretch';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Pagination } from '@heroui/react';
import { Products } from '@/components/products/products';
import { ProductsResult } from '@repo/cms-types'; // Import types as needed
import { getBaseUrl } from '@/utils/url';

export const fetchProducts = async ({ page = 1 }: { page?: number }) => {
  const baseUrl = getBaseUrl();
  return wretch(`${baseUrl}/cms/products?page=${page}`).get().json<ProductsResult>();
};

const Home = async ({ searchParams }: { searchParams: { page: string } }) => {
  const queryClient = new QueryClient();

  const { page } = await searchParams;

  const pageNumber = Number(page) || 1;

  await queryClient.prefetchQuery({
    queryKey: ['products', pageNumber],
    queryFn: () => fetchProducts({ page: pageNumber }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Products page={pageNumber} />
      <div className="flex justify-center mt-8">
        <Pagination total={10} initialPage={pageNumber} />
      </div>
    </HydrationBoundary>
  );
};

export default Home;

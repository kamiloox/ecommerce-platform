import React from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { Product, ProductsResult } from '@repo/cms-types';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Pagination } from '@heroui/react';
import { Products } from '@/components/products/products';
import { getManyProducts } from '@/lib/api';

const Home = async ({ searchParams }: { searchParams: { page: string } }) => {
  const queryClient = new QueryClient();

  const { page } = await searchParams;

  const pageNumber = Number(page) || 1;

  await queryClient.prefetchQuery({
    queryKey: ['products', pageNumber],
    queryFn: () => getManyProducts({ page: pageNumber }),
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

import React from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Products } from '@/components/products/products';
import { getManyProducts, searchProducts } from '@/lib/api';

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }>;
}) => {
  const queryClient = new QueryClient();

  const { page, q: searchQuery, sortBy, sortOrder } = await searchParams;

  const pageNumber = Number(page) || 1;

  // Get the sort value that matches the component's logic
  const getSortValue = () => {
    const field = sortBy || 'createdAt';
    const order = sortOrder || 'desc';
    // Find matching sort option from SORT_OPTIONS
    if (field === 'createdAt' && order === 'desc') return 'newest';
    if (field === 'price' && order === 'asc') return 'price-asc';
    if (field === 'price' && order === 'desc') return 'price-desc';
    if (field === 'name' && order === 'asc') return 'name-asc';
    if (field === 'featured' && order === 'desc') return 'featured';
    return 'newest';
  };

  const sortValue = getSortValue();

  // Prefetch either search results or regular products based on query
  if (searchQuery && searchQuery.trim().length >= 2) {
    await queryClient.prefetchQuery({
      queryKey: ['searchProducts', searchQuery, pageNumber, sortValue],
      queryFn: () => searchProducts({ query: searchQuery, page: pageNumber, sortBy, sortOrder }),
    });
  } else {
    await queryClient.prefetchQuery({
      queryKey: ['products', pageNumber, sortValue],
      queryFn: () => getManyProducts({ page: pageNumber, sortBy, sortOrder }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Products
        page={pageNumber}
        initialSearchQuery={searchQuery}
        initialSortBy={sortBy}
        initialSortOrder={sortOrder}
      />
    </HydrationBoundary>
  );
};

export default Home;

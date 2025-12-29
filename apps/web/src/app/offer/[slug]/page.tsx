import React from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/product-details/product-details';
import { getProduct } from '@/lib/api';

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const queryClient = new QueryClient();

  const { slug } = await params;

  const product = await getProduct({ slug });

  if (!product) {
    notFound();
  }

  queryClient.setQueryData(['product', slug], product);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetails slug={slug} />
    </HydrationBoundary>
  );
};

export default ProductPage;

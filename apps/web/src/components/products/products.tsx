'use client';
import { getManyProducts, searchProducts } from '@/lib/api';
import { getImageUrl } from '@/utils/image';
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  addToast,
  Spinner,
  Pagination,
} from '@heroui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart } from '@/api/cart';
import { getCurrentUser } from '@/api/users';
import { ProductSearch } from './product-search';
import { ProductSort, type SortOption, SORT_OPTIONS } from './product-sort';
import { useState, useEffect, useCallback } from 'react';

interface ProductsProps {
  page: number;
  initialSearchQuery?: string;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export const Products = ({
  page,
  initialSearchQuery,
  initialSortBy,
  initialSortOrder,
}: ProductsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [isSearching, setIsSearching] = useState(
    Boolean(initialSearchQuery && initialSearchQuery.length >= 2),
  );

  // Initialize sort state from URL or defaults
  const getInitialSortValue = () => {
    const sortBy = initialSortBy || 'createdAt';
    const sortOrder = initialSortOrder || 'desc';
    const sortOption = SORT_OPTIONS.find(
      (option) => option.field === sortBy && option.order === sortOrder,
    );
    return sortOption?.value || 'newest';
  };

  const [sortValue, setSortValue] = useState<string>(getInitialSortValue());
  const [currentPage, setCurrentPage] = useState<number>(page);

  const getCurrentSortOption = (): SortOption => {
    return (
      (SORT_OPTIONS.find((option) => option.value === sortValue) as SortOption) || SORT_OPTIONS[0]
    );
  };

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', currentPage, sortValue],
    queryFn: () => {
      const sortOption = getCurrentSortOption();
      return getManyProducts({
        page: currentPage,
        sortBy: sortOption.field,
        sortOrder: sortOption.order,
      });
    },
    enabled: !isSearching || searchQuery.length === 0,
  });

  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['searchProducts', searchQuery, currentPage, sortValue],
    queryFn: () => {
      const sortOption = getCurrentSortOption();
      return searchProducts({
        query: searchQuery,
        page: currentPage,
        sortBy: sortOption.field,
        sortOrder: sortOption.order,
      });
    },
    enabled: isSearching && searchQuery.length >= 2,
  });

  const data = isSearching && searchQuery.length >= 2 ? searchData : productsData;
  const isLoading = isSearching && searchQuery.length >= 2 ? isLoadingSearch : isLoadingProducts;

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { isAuthenticated } = useAuth();

  // Function to update URL with search query, sort params, and page
  const updateUrlWithParams = useCallback(
    (query?: string, sortBy?: string, sortOrder?: string, pageNum?: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (query !== undefined) {
        if (query && query.trim().length >= 2) {
          params.set('q', query);
        } else {
          params.delete('q');
        }
      }

      if (sortBy && sortOrder) {
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
      }

      if (pageNum !== undefined) {
        if (pageNum > 1) {
          params.set('page', pageNum.toString());
        } else {
          params.delete('page');
        }
      }

      const newUrl = params.toString() ? `/?${params.toString()}` : '/';
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams],
  );

  // Sync state with URL on mount and when search params change
  useEffect(() => {
    const urlSearchQuery = searchParams.get('q') || '';
    const urlSortBy = searchParams.get('sortBy');
    const urlSortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
    const urlPage = Number(searchParams.get('page')) || 1;

    setSearchQuery(urlSearchQuery);
    setIsSearching(Boolean(urlSearchQuery && urlSearchQuery.length >= 2));
    setCurrentPage(urlPage);

    if (urlSortBy && urlSortOrder) {
      const sortOption = SORT_OPTIONS.find(
        (option) => option.field === urlSortBy && option.order === urlSortOrder,
      );
      if (sortOption) {
        setSortValue(sortOption.value);
      }
    }
  }, [searchParams]);

  const { mutate: addProductToCart } = useMutation({
    mutationFn: ({
      userId,
      productId,
      quantity,
    }: {
      userId: number;
      productId: number;
      quantity: number;
    }) => addToCart(userId, productId, quantity),
    onSuccess: () => {
      addToast({
        title: '🛒 Product added to cart successfully!',
        color: 'success',
      });
    },
    onError: () => {
      addToast({
        title: '❌ Failed to add product to cart. Please try again.',
        color: 'danger',
      });
    },
  });

  const handleAddToCart = (productId: number, productName: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to product details
    event.stopPropagation();

    if (!isAuthenticated || !currentUser?.user?.id) {
      addToast({
        title: '🔒 Please sign in to add items to your cart',
        color: 'warning',
      });

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }

    addProductToCart({ userId: currentUser.user.id, productId, quantity: 1 });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.trim().length >= 2);
    setCurrentPage(1); // Reset to first page
    const sortOption = getCurrentSortOption();
    updateUrlWithParams(query, sortOption.field, sortOption.order, 1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setCurrentPage(1); // Reset to first page
    const sortOption = getCurrentSortOption();
    updateUrlWithParams('', sortOption.field, sortOption.order, 1);
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortValue(sortOption.value);
    setCurrentPage(1); // Reset to first page when sorting changes
    updateUrlWithParams(searchQuery, sortOption.field, sortOption.order, 1);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    const sortOption = getCurrentSortOption();
    updateUrlWithParams(searchQuery, sortOption.field, sortOption.order, pageNum);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Section */}
      <div className="mb-6">
        <ProductSearch
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isLoading={isLoading}
          initialQuery={searchQuery}
        />
      </div>
      {/* Results Header with Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          {isSearching && searchQuery && searchQuery.length >= 2 ? (
            <h2 className="text-lg font-semibold text-gray-900">
              Search results for &ldquo;{searchQuery}&rdquo;
            </h2>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
          )}
        </div>

        <ProductSort
          value={sortValue}
          onChange={handleSortChange}
          isDisabled={isLoading}
          resultCount={data?.totalDocs}
        />
      </div>{' '}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      ) : data?.docs && data.docs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.docs.map((product) => {
            const image = product.images?.[0];

            return (
              <Link key={product.id} href={`/offer/${product.slug}`}>
                <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow">
                  <CardBody className="p-0">
                    <Image
                      alt={product.name}
                      className="w-full h-[300px] object-contain bg-white"
                      src={image ? getImageUrl(image) : ''}
                      removeWrapper
                    />
                  </CardBody>
                  <CardFooter className="flex flex-col items-start">
                    <div className="flex justify-between items-center w-full mb-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-default-500 font-medium">${product.price.toFixed(2)}</p>
                    </div>
                    <Button
                      color="primary"
                      variant="solid"
                      radius="full"
                      size="md"
                      startContent={<ShoppingCartIcon size={16} />}
                      className="w-full"
                      onClick={(event) => handleAddToCart(product.id, product.name, event)}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isSearching && searchQuery.length >= 2
              ? 'No products found matching your search.'
              : 'No products available.'}
          </p>
          {isSearching && searchQuery.length >= 2 && (
            <Button variant="flat" color="primary" className="mt-4" onClick={handleClearSearch}>
              View all products
            </Button>
          )}
        </div>
      )}
      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {data.totalPages} ({data.totalDocs} total products)
          </div>
          <Pagination
            total={data.totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            isDisabled={isLoading}
            classNames={{
              wrapper: 'gap-0 overflow-visible',
              item: 'w-9 h-9 text-small',
              cursor:
                'bg-gradient-to-b shadow-lg from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 text-white font-semibold',
              prev: isLoading ? 'opacity-50' : '',
              next: isLoading ? 'opacity-50' : '',
            }}
          />
        </div>
      )}
    </div>
  );
};

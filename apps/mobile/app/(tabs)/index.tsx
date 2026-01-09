import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl, View, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  Avatar,
  Snackbar,
  Searchbar,
  Menu,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Product, ProductsResult } from '@repo/cms-types';
import { productsService } from '../../src/api/products';
import cartService from '../../src/api/cart';
import { getProductImageUrl } from '../../src/api/client';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCartContext } from '../../src/contexts/CartContext';
import { useDebounce } from '../../src/hooks/useDebounce';

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' as const },
  { value: 'price-asc', label: 'Price (Low to High)', field: 'price', order: 'asc' as const },
  { value: 'price-desc', label: 'Price (High to Low)', field: 'price', order: 'desc' as const },
  { value: 'name-asc', label: 'Name (A-Z)', field: 'name', order: 'asc' as const },
  { value: 'featured', label: 'Featured First', field: 'featured', order: 'desc' as const },
];

export default function ProductsScreen() {
  const { user, isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartContext();
  const insets = useSafeAreaInsets();

  // State management
  const [productsData, setProductsData] = useState<ProductsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showAuthSnackbar, setShowAuthSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState(SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Debounced search query (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const loadProducts = useCallback(
    async (
      page: number = 1,
      append: boolean = false,
      search?: string,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc',
    ): Promise<void> => {
      try {
        if (!append) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        let data: ProductsResult;

        if (search && search.trim().length >= 2) {
          // Search products
          data = await productsService.searchProducts({
            query: search.trim(),
            page,
            sortBy,
            sortOrder,
          });
        } else {
          // Get all products
          data = await productsService.getProducts({
            page,
            limit: 20,
            status: 'published',
            sortBy,
            sortOrder,
          });
        }

        if (append && productsData) {
          // Append new products to existing list
          setProductsData({
            ...data,
            docs: [...productsData.docs, ...data.docs],
          });
        } else {
          // Replace products list
          setProductsData(data);
        }

        setCurrentPage(page);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [productsData],
  );

  // Initial load
  useEffect(() => {
    if (currentSort && !initialLoadComplete) {
      loadProducts(1, false, '', currentSort.field, currentSort.order).then(() => {
        setInitialLoadComplete(true);
      });
    }
  }, []);

  // Respond to debounced search query changes
  useEffect(() => {
    // Only trigger search after initial load is complete to prevent interference
    if (currentSort && initialLoadComplete) {
      console.log('Debounced search triggered:', debouncedSearchQuery);
      setIsSearching(debouncedSearchQuery.trim().length >= 2);
      setCurrentPage(1);
      loadProducts(1, false, debouncedSearchQuery, currentSort.field, currentSort.order);
    }
  }, [debouncedSearchQuery, currentSort, initialLoadComplete]);

  // Handle search input change (just update local state, debouncing will trigger the API call)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Don't trigger API call here - the useEffect with debouncedSearchQuery will handle it
  }, []);

  // Handle sort change
  const handleSortChange = useCallback(
    (sortOption: (typeof SORT_OPTIONS)[0]) => {
      setCurrentSort(sortOption);
      setSortMenuVisible(false);
      setCurrentPage(1);
      loadProducts(1, false, debouncedSearchQuery, sortOption.field, sortOption.order);
    },
    [debouncedSearchQuery],
  );

  // Handle load more (pagination)
  const handleLoadMore = useCallback(() => {
    if (productsData && productsData.hasNextPage && !loadingMore && currentSort) {
      const nextPage = currentPage + 1;
      loadProducts(nextPage, true, debouncedSearchQuery, currentSort.field, currentSort.order);
    }
  }, [productsData, loadingMore, currentPage, debouncedSearchQuery, currentSort]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    if (currentSort) {
      loadProducts(1, false, debouncedSearchQuery, currentSort.field, currentSort.order);
    }
  }, [debouncedSearchQuery, currentSort]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    setCurrentPage(1);
    // The useEffect will handle the API call when debouncedSearchQuery becomes empty
  }, []);

  const addToCart = async (productId: number, productName: string) => {
    if (!isAuthenticated || !user) {
      setSnackbarMessage('🔒 Please sign in to add items to your cart');
      setShowAuthSnackbar(true);

      // Show the alert after a brief delay so user sees the snackbar first
      setTimeout(() => {
        Alert.alert('Login Required', 'Please sign in to add items to your cart', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/login') },
        ]);
      }, 500);
      return;
    }

    try {
      setAddingToCart(productId);
      await cartService.addToCart(user.id, productId, 1);
      refreshCartCount(); // Refresh the tab badge

      Alert.alert('🛒 Success!', `${productName} has been added to your cart`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.navigate('/(tabs)/cart') },
      ]);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to add item to cart. Please try again.', [{ text: 'OK' }]);
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16 }}>
            Loading products...
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <Surface
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              paddingTop: Math.max(8, insets.top),
              elevation: 2,
            }}
          >
            <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
              Products
            </Text>
          </Surface>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Avatar.Icon
              size={64}
              icon="alert-circle"
              style={{ backgroundColor: '#ffcdd2', marginBottom: 16 }}
            />
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              Oops! Something went wrong
            </Text>
            <Text
              variant="bodyMedium"
              style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
            >
              {error}
            </Text>
            <Button
              mode="contained"
              onPress={() =>
                currentSort &&
                loadProducts(1, false, debouncedSearchQuery, currentSort.field, currentSort.order)
              }
            >
              Try Again
            </Button>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Surface
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            paddingTop: Math.max(8, insets.top),
            elevation: 2,
          }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
            Products {productsData?.totalDocs ? `(${productsData.totalDocs})` : ''}
          </Text>

          {/* Search bar */}
          <Searchbar
            placeholder="Search products..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={{ marginBottom: 12 }}
            icon="magnify"
            clearIcon="close"
            onClearIconPress={clearSearch}
          />

          {/* Sort and results info */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              {productsData && (
                <Text variant="bodySmall" style={{ color: '#666' }}>
                  {isSearching ? 'Search results: ' : ''}
                  {productsData.totalDocs} product{productsData.totalDocs !== 1 ? 's' : ''}
                </Text>
              )}
            </View>

            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  compact
                  icon="sort"
                  onPress={() => setSortMenuVisible(true)}
                >
                  {currentSort?.label || 'Sort'}
                </Button>
              }
            >
              {SORT_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => handleSortChange(option)}
                  title={option.label}
                  leadingIcon={currentSort?.value === option.value ? 'check' : undefined}
                />
              ))}
            </Menu>
          </View>
        </Surface>{' '}
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {productsData?.docs?.map((product: Product) => (
            <Card
              key={product.id}
              style={{
                marginBottom: 16,
                elevation: 4,
                borderRadius: 12,
              }}
              mode="elevated"
            >
              <Card.Cover
                source={{
                  uri: getProductImageUrl(product),
                }}
                style={{ height: 200, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
              <Card.Content style={{ paddingTop: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: '#666', marginBottom: 8 }}>
                      {product.tags?.[0]?.tag || 'Product'}
                    </Text>
                  </View>
                  <Chip
                    icon={(product.quantity || 0) > 0 ? 'check-circle' : 'clock-outline'}
                    mode="outlined"
                    style={{
                      backgroundColor: (product.quantity || 0) > 0 ? '#e8f5e8' : '#fff3e0',
                      borderColor: (product.quantity || 0) > 0 ? '#4caf50' : '#ff9800',
                    }}
                    textStyle={{
                      color: (product.quantity || 0) > 0 ? '#2e7d32' : '#ef6c00',
                      fontSize: 12,
                    }}
                  >
                    {(product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                  </Chip>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <Chip
                      icon="percent"
                      mode="flat"
                      style={{ backgroundColor: '#ff5722', marginRight: 8 }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      SALE
                    </Chip>
                  )}
                  <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <Text
                        variant="bodySmall"
                        style={{
                          textDecorationLine: 'line-through',
                          color: '#999',
                        }}
                      >
                        ${product.compareAtPrice.toFixed(2)}
                      </Text>
                    )}
                    <Text
                      variant="titleLarge"
                      style={{
                        color: '#1976d2',
                        fontWeight: 'bold',
                      }}
                    >
                      ${product.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card.Content>

              <Card.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
                <Button
                  mode="outlined"
                  icon="eye"
                  onPress={() => {
                    router.push(`/product/${product.id}`);
                  }}
                  style={{ flex: 1, marginRight: 8 }}
                >
                  Details
                </Button>
                <Button
                  mode="contained"
                  icon="cart-plus"
                  onPress={() => addToCart(product.id, product.name)}
                  disabled={
                    !product.quantity || product.quantity <= 0 || addingToCart === product.id
                  }
                  loading={addingToCart === product.id}
                  style={{ flex: 1, marginLeft: 8 }}
                >
                  {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </Card.Actions>
            </Card>
          ))}

          {(!productsData?.docs || productsData.docs.length === 0) && (
            <Card style={{ padding: 32, alignItems: 'center' }}>
              <Avatar.Icon
                size={64}
                icon="magnify"
                style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }}
              />
              <Text variant="headlineSmall">No products found</Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
                {isSearching && searchQuery.length >= 2
                  ? `No products match "${searchQuery}". Try a different search term.`
                  : 'No products are available at the moment.'}
              </Text>
              {isSearching && searchQuery.length >= 2 && (
                <Button mode="outlined" onPress={clearSearch} style={{ marginTop: 16 }}>
                  View All Products
                </Button>
              )}
            </Card>
          )}

          {/* Load More Button for Pagination */}
          {productsData && productsData.hasNextPage && (
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Button
                mode="outlined"
                icon="reload"
                onPress={handleLoadMore}
                loading={loadingMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Products'}
              </Button>
              <Text variant="bodySmall" style={{ marginTop: 8, color: '#666' }}>
                Page {productsData.page} of {productsData.totalPages}
              </Text>
            </View>
          )}
        </ScrollView>
        {/* Authentication Snackbar */}
        <Snackbar
          visible={showAuthSnackbar}
          onDismiss={() => setShowAuthSnackbar(false)}
          duration={3000}
          action={{
            label: 'Sign In',
            onPress: () => {
              setShowAuthSnackbar(false);
              router.push('/login');
            },
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

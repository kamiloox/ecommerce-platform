import React, { useState, useEffect } from 'react';
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
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Product } from '@repo/cms-types';
import productsService from '../../src/api/products';
import cartService from '../../src/api/cart';
import { getProductImageUrl } from '@repo/shared-utils/products';
import { getApiBaseUrl } from '@repo/shared-utils/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCartContext } from '../../src/contexts/CartContext';

export default function ProductsScreen() {
  const { user, isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartContext();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showAuthSnackbar, setShowAuthSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadProducts = async () => {
    try {
      setError(null);
      const data = await productsService.getProducts();

      const normalizedData = data.map((product) => ({
        ...product,
        quantity:
          product.quantity !== null && product.quantity !== undefined
            ? Number(product.quantity)
            : 0,
      }));

      setProducts(normalizedData);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

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
            <Button mode="contained" onPress={loadProducts}>
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
            Products {products.length > 0 && `(${products.length})`}
          </Text>
        </Surface>{' '}
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {products.map((product) => (
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
                  uri: getProductImageUrl(product, getApiBaseUrl().replace('/api', '')),
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

          {products.length === 0 && (
            <Card style={{ padding: 32, alignItems: 'center' }}>
              <Avatar.Icon
                size={64}
                icon="magnify"
                style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }}
              />
              <Text variant="headlineSmall">No products found</Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
                No products available at the moment
              </Text>
            </Card>
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

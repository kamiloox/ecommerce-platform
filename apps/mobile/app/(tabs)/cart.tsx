import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  Surface,
  ActivityIndicator,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Cart } from '@repo/cms-types';
import cartService from '../../src/api/cart';
import { getProductImageUrl } from '@repo/shared-utils/products';
import { getApiBaseUrl } from '@repo/shared-utils/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCartContext } from '../../src/contexts/CartContext';
import { useCallback } from 'react';

export default function CartScreen() {
  const { user, isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartContext();
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const loadCart = async () => {
    if (!isAuthenticated || !user) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await cartService.getUserCart(user.id);
      setCart(data);
    } catch (err) {
      setError('Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated, user]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && user) {
        loadCart();
      }
    }, [isAuthenticated, user]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  };

  const removeFromCart = async (productId: number, productName: string) => {
    if (!user) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(productId.toString()));
      await cartService.removeFromCart(user.id, productId);
      await loadCart();
      refreshCartCount(); // Refresh the tab badge

      Alert.alert('🗑️ Removed', `${productName} has been removed from your cart`);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to remove item from cart. Please try again.');
      console.error('Error removing from cart:', error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId.toString());
        return newSet;
      });
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (!user || newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(productId.toString()));
      await cartService.updateCartItemQuantity(user.id, productId, newQuantity);
      await loadCart();
      refreshCartCount(); // Refresh the tab badge
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to update quantity. Please try again.');
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId.toString());
        return newSet;
      });
    }
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  if (!isAuthenticated) {
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
              Cart
            </Text>
          </Surface>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Avatar.Icon
              size={64}
              icon="cart-outline"
              style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }}
            />
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              Your cart is empty
            </Text>
            <Text
              variant="bodyMedium"
              style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
            >
              Browse our products and login to add items to your cart
            </Text>
            <View style={{ flexDirection: 'column', gap: 12, width: '100%' }}>
              <Button mode="contained" onPress={() => router.navigate('/(tabs)')} icon="shopping">
                Browse Products
              </Button>
              <Button mode="outlined" onPress={() => router.push('/login')} icon="login">
                Login to View Cart
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (loading) {
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
              Cart
            </Text>
          </Surface>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Loading cart...
            </Text>
          </View>
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
              Cart
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
            <Button mode="contained" onPress={loadCart}>
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
            Cart {cart && cart.itemCount > 0 && `(${cart.itemCount} items)`}
          </Text>
        </Surface>{' '}
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {!cart || !cart.items || cart.items.length === 0 ? (
            <Card style={{ padding: 32, alignItems: 'center' }}>
              <Avatar.Icon
                size={64}
                icon="cart-outline"
                style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }}
              />
              <Text variant="headlineSmall">Your cart is empty</Text>
              <Text
                variant="bodyMedium"
                style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
              >
                Add some products to get started
              </Text>
              <Button mode="contained" onPress={() => router.navigate('/(tabs)')}>
                Browse Products
              </Button>
            </Card>
          ) : (
            <>
              {cart.items.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null;
                const productId =
                  typeof item.product === 'number' ? item.product : product?.id || 0;
                const isUpdating = updatingItems.has(productId.toString());

                if (!product) return null;

                return (
                  <Card
                    key={productId}
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
                      style={{ height: 120, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                    />
                    <Card.Content style={{ paddingTop: 16 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text variant="titleMedium" numberOfLines={2}>
                            {product.name}
                          </Text>
                          <Text variant="bodyMedium" style={{ color: '#666', marginTop: 4 }}>
                            ${item.unitPrice.toFixed(2)} each
                          </Text>
                        </View>
                        <IconButton
                          icon="delete"
                          iconColor="#f44336"
                          size={20}
                          onPress={() => removeFromCart(productId, product.name)}
                          disabled={isUpdating}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 12,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <IconButton
                            icon="minus"
                            size={16}
                            mode="outlined"
                            onPress={() => updateQuantity(productId, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                          />
                          <Text variant="titleMedium" style={{ marginHorizontal: 16 }}>
                            {item.quantity}
                          </Text>
                          <IconButton
                            icon="plus"
                            size={16}
                            mode="outlined"
                            onPress={() => updateQuantity(productId, item.quantity + 1)}
                            disabled={isUpdating}
                          />
                        </View>
                        <Text
                          variant="titleLarge"
                          style={{
                            color: '#1976d2',
                            fontWeight: 'bold',
                          }}
                        >
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })}

              {/* Cart Summary */}
              <Card style={{ marginTop: 16, elevation: 4 }}>
                <Card.Content>
                  <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
                    Order Summary
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <Text variant="bodyMedium">Items ({cart.itemCount})</Text>
                    <Text variant="bodyMedium">${cart.totalAmount.toFixed(2)}</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <Text variant="bodyMedium">Shipping</Text>
                    <Text variant="bodyMedium" style={{ color: '#4caf50' }}>
                      Free
                    </Text>
                  </View>

                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: '#e0e0e0',
                      paddingTop: 8,
                      marginTop: 8,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                        Total
                      </Text>
                      <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                        ${cart.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>

                <Card.Actions style={{ padding: 16 }}>
                  <Button
                    mode="contained"
                    onPress={proceedToCheckout}
                    style={{ flex: 1 }}
                    icon="credit-card"
                  >
                    Proceed to Checkout
                  </Button>
                </Card.Actions>
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

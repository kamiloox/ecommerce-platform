import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  Avatar,
  Divider,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Cart } from '@repo/cms-types';
import { cartService } from '../src/services/api';
import orderService, { ShippingAddress } from '../src/api/orders';
import { useAuth } from '../src/contexts/AuthContext';
import { useCartContext } from '../src/contexts/CartContext';

export default function CheckoutScreen() {
  const headerHeight = useHeaderHeight();
  const { user, isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartContext();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
  });

  useEffect(() => {
    loadCart();
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    try {
      const response = await cartService.getUserCart(user.id);
      if (response.error || !response.data || !response.data.items || response.data.items.length === 0) {
        Alert.alert('Empty Cart', 'Your cart is empty. Add some items first!', [
          { text: 'Browse Products', onPress: () => router.replace('/(tabs)') },
        ]);
        return;
      }
      setCart(response.data);
    } catch (err) {
      console.error('Error loading cart:', err);
      Alert.alert('Error', 'Failed to load cart', [{ text: 'OK', onPress: () => router.back() }]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const { firstName, lastName, address, city, zipCode } = shippingAddress;

    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter your address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter your city');
      return false;
    }
    if (!zipCode.trim()) {
      Alert.alert('Validation Error', 'Please enter your ZIP code');
      return false;
    }

    return true;
  };

  const processCheckout = async () => {
    if (!user || !cart || !validateForm()) return;

    setProcessing(true);
    try {
      // Prepare order items
      const orderItems =
        cart.items?.map((item) => {
          const productId = typeof item.product === 'number' ? item.product : item.product.id;
          return {
            product: productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        }) || [];

      // Create the order
      const order = await orderService.createOrder(
        {
          items: orderItems,
          shippingAddress,
        },
        user.id,
      );

      // Clear the cart after successful order
      await cartService.clearCart(user.id);
      refreshCartCount();

      // Show success message and navigate
      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Your order ${order.orderNumber} has been placed. You will receive a confirmation email shortly.`,
        [{ text: 'Continue Shopping', onPress: () => router.replace('/(tabs)') }],
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        '❌ Checkout Failed',
        'There was an error processing your order. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <Stack.Screen
            options={{
              title: 'Checkout',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Avatar.Icon
              size={64}
              icon="account-alert"
              style={{ backgroundColor: '#ffcdd2', marginBottom: 16 }}
            />
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              Login Required
            </Text>
            <Text
              variant="bodyMedium"
              style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
            >
              Please login to proceed with checkout
            </Text>
            <Button mode="contained" onPress={() => router.replace('/login')}>
              Login
            </Button>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <Stack.Screen
            options={{
              title: 'Checkout',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Loading...
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Stack.Screen
          options={{
            title: 'Checkout',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {/* Order Summary */}
          <Card style={{ marginBottom: 16, elevation: 4, borderRadius: 12 }} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom: 16 }}>
                Order Summary
              </Text>

              {cart?.items?.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null;
                const productId =
                  typeof item.product === 'number' ? item.product : product?.id || 0;

                if (!product) return null;

                return (
                  <View key={productId} style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                          ${item.unitPrice.toFixed(2)} × {item.quantity}
                        </Text>
                      </View>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <Divider style={{ marginVertical: 16 }} />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text variant="bodyMedium">Subtotal</Text>
                <Text variant="bodyMedium">${cart?.totalAmount.toFixed(2)}</Text>
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

              <Divider style={{ marginVertical: 8 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  Total
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  ${cart?.totalAmount.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Shipping Address */}
          <Card style={{ marginBottom: 16, elevation: 4, borderRadius: 12 }} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={{ marginBottom: 16 }}>
                Shipping Address
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <TextInput
                  label="First Name"
                  value={shippingAddress.firstName}
                  onChangeText={(text) =>
                    setShippingAddress((prev) => ({ ...prev, firstName: text }))
                  }
                  style={{ flex: 1 }}
                  mode="outlined"
                />
                <TextInput
                  label="Last Name"
                  value={shippingAddress.lastName}
                  onChangeText={(text) =>
                    setShippingAddress((prev) => ({ ...prev, lastName: text }))
                  }
                  style={{ flex: 1 }}
                  mode="outlined"
                />
              </View>

              <TextInput
                label="Address"
                value={shippingAddress.address}
                onChangeText={(text) => setShippingAddress((prev) => ({ ...prev, address: text }))}
                style={{ marginBottom: 12 }}
                mode="outlined"
                multiline
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput
                  label="City"
                  value={shippingAddress.city}
                  onChangeText={(text) => setShippingAddress((prev) => ({ ...prev, city: text }))}
                  style={{ flex: 1 }}
                  mode="outlined"
                />
                <TextInput
                  label="ZIP Code"
                  value={shippingAddress.zipCode}
                  onChangeText={(text) =>
                    setShippingAddress((prev) => ({ ...prev, zipCode: text }))
                  }
                  style={{ flex: 1 }}
                  mode="outlined"
                />
              </View>
            </Card.Content>
          </Card>

          {/* Place Order Button */}
          <Card style={{ elevation: 4, borderRadius: 12 }} mode="elevated">
            <Card.Actions style={{ padding: 16 }}>
              <Button
                mode="contained"
                onPress={processCheckout}
                disabled={processing}
                loading={processing}
                style={{ flex: 1 }}
                icon="credit-card"
              >
                {processing ? 'Processing...' : `Place Order - $${cart?.totalAmount.toFixed(2)}`}
              </Button>
            </Card.Actions>
          </Card>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

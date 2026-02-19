import React, { useState, useEffect } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Avatar, Chip } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Order } from '@repo/cms-types';
import orderService from '../src/api/orders';
import { useAuth } from '../src/contexts/AuthContext';

export default function OrdersScreen() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    if (!isAuthenticated || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await orderService.getUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'processing':
        return '#2196f3';
      case 'shipped':
        return '#9c27b0';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'processing':
        return 'cog-outline';
      case 'shipped':
        return 'truck-outline';
      case 'delivered':
        return 'check-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <Stack.Screen
            options={{
              title: 'Orders',
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
              Please login to view your orders
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
              title: 'Orders',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Loading orders...
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
          <Stack.Screen
            options={{
              title: 'Orders',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />

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
            <Button mode="contained" onPress={loadOrders}>
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
        <Stack.Screen
          options={{
            title: `Orders${orders.length > 0 ? ` (${orders.length})` : ''}`,
            headerBackButtonDisplayMode: 'minimal',
          }}
        />

        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {orders.length === 0 ? (
            <Card style={{ padding: 32, alignItems: 'center' }}>
              <Avatar.Icon
                size={64}
                icon="receipt-outline"
                style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }}
              />
              <Text variant="headlineSmall">No orders yet</Text>
              <Text
                variant="bodyMedium"
                style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
              >
                When you place orders, they will appear here
              </Text>
              <Button mode="contained" onPress={() => router.navigate('/(tabs)')}>
                Start Shopping
              </Button>
            </Card>
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                style={{
                  marginBottom: 16,
                  elevation: 4,
                  borderRadius: 12,
                }}
                mode="elevated"
              >
                <Card.Content style={{ paddingTop: 16, paddingBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {order.orderNumber}
                      </Text>
                      <Text variant="bodySmall" style={{ color: '#666' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      mode="outlined"
                      style={{
                        backgroundColor: `${getStatusColor(order.status)}20`,
                        borderColor: getStatusColor(order.status),
                      }}
                      textStyle={{
                        color: getStatusColor(order.status),
                        fontWeight: 'bold',
                      }}
                    >
                      {order.status.toUpperCase()}
                    </Chip>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text variant="bodyMedium">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={{
                        color: '#1976d2',
                        fontWeight: 'bold',
                      }}
                    >
                      ${order.totalAmount.toFixed(2)}
                    </Text>
                  </View>

                  {/* Show first few items */}
                  {order.items.slice(0, 2).map((item, index) => {
                    const product = typeof item.product === 'object' ? item.product : null;
                    if (!product) return null;

                    return (
                      <Text
                        key={index}
                        variant="bodySmall"
                        style={{ color: '#666', marginBottom: 4 }}
                      >
                        {item.quantity}× {product.name}
                      </Text>
                    );
                  })}

                  {order.items.length > 2 && (
                    <Text variant="bodySmall" style={{ color: '#666', fontStyle: 'italic' }}>
                      +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                    </Text>
                  )}
                </Card.Content>

                {order.status === 'delivered' && (
                  <Card.Actions style={{ paddingHorizontal: 16 }}>
                    <Button
                      mode="contained"
                      icon="cart-plus"
                      onPress={() => {
                        router.navigate('/(tabs)');
                      }}
                      style={{ flex: 1 }}
                    >
                      Reorder
                    </Button>
                  </Card.Actions>
                )}
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

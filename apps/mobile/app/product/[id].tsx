import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, Dimensions, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  Surface,
  IconButton,
  Chip,
  Divider,
  List,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Product } from '@repo/cms-types';
import productsService from '../../src/api/products';
import cartService from '../../src/api/cart';
import { getProductImageUrl } from '../../src/api/client';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCartContext } from '../../src/contexts/CartContext';

// Types for rich text structure
interface RichTextChild {
  type: string;
  text?: string;
  children?: RichTextChild[];
  version?: number;
  [key: string]: unknown;
}

interface RichTextStructure {
  root: {
    type: string;
    children: RichTextChild[];
    direction: ('ltr' | 'rtl') | null;
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
    indent: number;
    version: number;
  };
  [key: string]: unknown;
}

// Helper function to extract plain text from rich text structure
const extractTextFromRichText = (richText: RichTextStructure | null | undefined): string => {
  if (!richText || !richText.root || !richText.root.children) {
    return '';
  }

  const extractFromChildren = (children: RichTextChild[]): string => {
    return children
      .map((child) => {
        if (child.type === 'text') {
          return child.text || '';
        }
        if (child.children && Array.isArray(child.children)) {
          return extractFromChildren(child.children);
        }
        return '';
      })
      .join(' ')
      .trim();
  };

  return extractFromChildren(richText.root.children);
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAuthSnackbar, setShowAuthSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const productData = await productsService.getProductById(id);

        // Ensure quantity is a number
        if (productData) {
          productData.quantity =
            productData.quantity !== null && productData.quantity !== undefined
              ? Number(productData.quantity)
              : 0;
        }

        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTintColor: '#000',
            headerShadowVisible: true,
            headerBackTitle: 'Products',
          }}
        />

        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
                Loading product...
              </Text>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Product Not Found',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            headerTintColor: '#000',
            headerShadowVisible: true,
            headerBackTitle: 'Products',
          }}
        />

        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
              <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
                Product Not Found
              </Text>
              <Text
                variant="bodyMedium"
                style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
              >
                The product you're looking for doesn't exist or has been removed.
              </Text>
              <Button mode="contained" onPress={() => router.back()}>
                Go Back
              </Button>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </>
    );
  }

  const handleAddToCart = async () => {
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

    if (!product) return;

    try {
      setAddingToCart(true);
      await cartService.addToCart(user.id, product.id, quantity);
      refreshCartCount();

      Alert.alert('🛒 Success!', `${product.name} has been added to your cart`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.navigate('/(tabs)/cart') },
      ]);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to add item to cart. Please try again.');
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product.quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const savings =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : 0;
  const discountPercentage =
    savings && product.compareAtPrice ? Math.round((savings / product.compareAtPrice) * 100) : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: product.name,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTintColor: '#000',
          headerShadowVisible: true,
          headerBackTitle: 'Products',
        }}
      />

      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Product Image with Featured Badge */}
            <View style={{ position: 'relative' }}>
              <Card style={{ margin: 16, elevation: 4 }}>
                <Image
                  source={{
                    uri: getProductImageUrl(product),
                  }}
                  style={{
                    width: screenWidth - 32,
                    height: screenWidth - 32,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                  resizeMode="cover"
                />
              </Card>

              {/* Featured Badge */}
              {product.featured && (
                <Chip
                  icon="star"
                  mode="flat"
                  style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    backgroundColor: '#ff6f00',
                    elevation: 4,
                  }}
                  textStyle={{ color: 'white', fontWeight: 'bold' }}
                >
                  FEATURED
                </Chip>
              )}

              {/* Sale Badge */}
              {discountPercentage > 0 && (
                <Chip
                  icon="percent"
                  mode="flat"
                  style={{
                    position: 'absolute',
                    top: product.featured ? 70 : 24,
                    right: 24,
                    backgroundColor: '#ff5722',
                    elevation: 4,
                  }}
                  textStyle={{ color: 'white', fontWeight: 'bold' }}
                >
                  {discountPercentage}% OFF
                </Chip>
              )}
            </View>

            {/* Product Info */}
            <Card style={{ margin: 16, marginTop: 0, elevation: 2 }}>
              <Card.Content style={{ padding: 24 }}>
                {/* Product Name & Tags */}
                <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
                  {product.name}
                </Text>

                {product.tags && product.tags.length > 0 && (
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}
                  >
                    {product.tags.map((tagObj, index) => (
                      <Chip
                        key={index}
                        mode="outlined"
                        style={{ backgroundColor: '#e3f2fd' }}
                        textStyle={{ color: '#1976d2' }}
                      >
                        {tagObj.tag}
                      </Chip>
                    ))}
                  </View>
                )}

                {/* Stock Status */}
                <Chip
                  icon={(product.quantity || 0) > 0 ? 'check-circle' : 'clock-outline'}
                  mode="outlined"
                  style={{
                    backgroundColor: (product.quantity || 0) > 0 ? '#e8f5e8' : '#fff3e0',
                    borderColor: (product.quantity || 0) > 0 ? '#4caf50' : '#ff9800',
                    alignSelf: 'flex-start',
                    marginBottom: 16,
                  }}
                  textStyle={{
                    color: (product.quantity || 0) > 0 ? '#2e7d32' : '#ef6c00',
                  }}
                >
                  {(product.quantity || 0) > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                </Chip>

                {/* Price */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <Chip
                      icon="percent"
                      mode="flat"
                      style={{ backgroundColor: '#ff5722', marginRight: 12 }}
                      textStyle={{ color: 'white', fontSize: 12 }}
                    >
                      SALE
                    </Chip>
                  )}
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <Text
                        variant="bodyMedium"
                        style={{
                          textDecorationLine: 'line-through',
                          color: '#999',
                          marginBottom: 4,
                        }}
                      >
                        ${product.compareAtPrice.toFixed(2)}
                      </Text>
                    )}
                    <Text
                      variant="headlineMedium"
                      style={{
                        color: '#1976d2',
                        fontWeight: 'bold',
                      }}
                    >
                      ${product.price.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Savings */}
                {savings > 0 && (
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: '#4caf50',
                      fontWeight: 'bold',
                      marginBottom: 16,
                    }}
                  >
                    Save ${savings.toFixed(2)} ({discountPercentage}% off)
                  </Text>
                )}

                <Divider style={{ marginVertical: 16 }} />

                {/* Description */}
                {(product.shortDescription || product.description) && (
                  <>
                    <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                      Description
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: '#666',
                        lineHeight: 22,
                        marginBottom: 16,
                      }}
                    >
                      {product.shortDescription || extractTextFromRichText(product.description)}
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>

            {/* Features */}
            <Card style={{ margin: 16, marginTop: 0, elevation: 2 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                  Features & Benefits
                </Text>

                <List.Item
                  title="Free Shipping"
                  description="On orders over $500"
                  left={(props) => <List.Icon {...props} icon="truck-delivery" />}
                />

                <Divider style={{ marginVertical: 8 }} />

                <List.Item
                  title="30-Day Returns"
                  description="Money-back guarantee"
                  left={(props) => <List.Icon {...props} icon="refresh" />}
                />

                <Divider style={{ marginVertical: 8 }} />

                <List.Item
                  title="2-Year Warranty"
                  description="Manufacturer warranty included"
                  left={(props) => <List.Icon {...props} icon="shield-check" />}
                />
              </Card.Content>
            </Card>
          </ScrollView>

          {/* Bottom Action Bar */}
          <Surface
            style={{
              padding: 16,
              elevation: 8,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {/* Quantity Selector */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="bodyMedium" style={{ marginRight: 12 }}>
                  Qty:
                </Text>
                <IconButton
                  icon="minus"
                  size={20}
                  mode="outlined"
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                />
                <Text
                  variant="titleMedium"
                  style={{
                    marginHorizontal: 16,
                    minWidth: 30,
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </Text>
                <IconButton
                  icon="plus"
                  size={20}
                  mode="outlined"
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity >= 10} // Max 10 items
                />
              </View>

              {/* Add to Cart Button */}
              <Button
                mode="contained"
                icon="cart-plus"
                onPress={handleAddToCart}
                loading={addingToCart}
                disabled={addingToCart}
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 8 }}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </View>
          </Surface>

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
    </>
  );
}

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Cart, Product } from '@repo/cms-types';
import {
  getUserCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from '../api/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  totalAmount: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const loadUserCart = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userCart = await getUserCart(user.id);
      setCart(userCart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user, loadUserCart]);

  const addItem = async (product: Product, quantity: number = 1): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to add items to cart');
    }

    try {
      setIsLoading(true);
      const updatedCart = await addToCart(user.id, product.id, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: number): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to remove items from cart');
    }

    try {
      setIsLoading(true);
      const updatedCart = await removeFromCart(user.id, productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to update cart items');
    }

    try {
      setIsLoading(true);
      const updatedCart = await updateCartItemQuantity(user.id, productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCartItems = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to clear cart');
    }

    try {
      setIsLoading(true);
      const updatedCart = await clearCart(user.id);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async (): Promise<void> => {
    await loadUserCart();
  };

  const itemCount = cart?.itemCount || 0;
  const totalAmount = cart?.totalAmount || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    itemCount,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCartItems,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

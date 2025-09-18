import { Product } from '@repo/cms-types';
import authService from './auth';
import { getApiBaseUrl } from '@repo/shared-utils/api';

const API_BASE_URL = getApiBaseUrl();

export interface CartItem {
  product: number | Product;
  quantity: number;
  unitPrice: number;
  id?: string | null;
}

export interface CartResponse {
  id: number;
  user: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
  createdAt: string;
}

class CartService {
  async getUserCart(userId: number): Promise<CartResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No cart exists yet
          return null;
        }
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user cart:', error);
      return null;
    }
  }

  async addToCart(userId: number, productId: number, quantity: number = 1): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add to cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async removeFromCart(userId: number, productId: number): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}&productId=${productId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to remove from cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update cart item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async clearCart(userId: number): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to clear cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export const cartService = new CartService();
export default cartService;

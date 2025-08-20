import { HttpClient, ApiResponse, CartItem } from './types';

export interface CartResponse {
  id: number;
  user: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
  createdAt: string;
}

export class CartService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(httpClient: HttpClient, baseUrl: string) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async getUserCart(userId: number): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await this.httpClient.get<CartResponse>(`/cart?userId=${userId}`);
      
      if (response.status === 404) {
        // No cart exists yet - return empty cart structure
        return {
          data: {
            id: 0,
            user: userId,
            items: [],
            totalAmount: 0,
            itemCount: 0,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          status: 200,
        };
      }

      return response;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to get cart',
        status: 500,
      };
    }
  }

  async addToCart(userId: number, productId: number, quantity: number = 1): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await this.httpClient.post<CartResponse>('/cart', {
        userId,
        productId,
        quantity,
      });

      return response;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to add to cart',
        status: 500,
      };
    }
  }

  async updateCartItem(cartId: number, productId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await this.httpClient.patch<CartResponse>(`/cart/${cartId}`, {
        productId,
        quantity,
      });

      return response;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to update cart item',
        status: 500,
      };
    }
  }

  async removeFromCart(cartId: number, productId: number): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await this.httpClient.delete<CartResponse>(`/cart/${cartId}/items/${productId}`);

      return response;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to remove from cart',
        status: 500,
      };
    }
  }

  async clearCart(cartId: number): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await this.httpClient.delete<{ success: boolean }>(`/cart/${cartId}`);

      return response;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to clear cart',
        status: 500,
      };
    }
  }

  // Helper methods for cart calculations
  calculateCartTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }

  calculateCartItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  // Find item in cart
  findCartItem(items: CartItem[], productId: number): CartItem | undefined {
    return items.find(item => {
      // Handle both cases where product is ID or object
      if (typeof item.product === 'number') {
        return item.product === productId;
      } else {
        return item.product?.id === productId;
      }
    });
  }

  // Validate cart item
  isValidCartItem(item: Partial<CartItem>): item is CartItem {
    return !!(
      item.product &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      typeof item.unitPrice === 'number' &&
      item.unitPrice >= 0
    );
  }

  // Format cart for display
  formatCartForDisplay(cart: CartResponse): {
    id: number;
    itemCount: number;
    totalAmount: string;
    items: Array<{
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }>;
  } {
    return {
      id: cart.id,
      itemCount: cart.itemCount,
      totalAmount: cart.totalAmount.toFixed(2),
      items: cart.items.map(item => ({
        productId: typeof item.product === 'number' ? item.product : item.product?.id || 0,
        productName: typeof item.product === 'object' ? item.product?.name || 'Unknown Product' : 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: (item.unitPrice * item.quantity).toFixed(2),
      })),
    };
  }
}

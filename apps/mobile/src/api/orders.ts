import { Order } from '@repo/cms-types';
import authService from './auth';

const API_BASE_URL = __DEV__ ? 'http://192.168.0.6:3000' : 'https://your-production-api.com';

export interface CreateOrderData {
  items: Array<{
    product: number;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
  };
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
}

class OrderService {
  async createOrder(orderData: CreateOrderData, customerId: number): Promise<Order> {
    try {
      const orderWithCustomer = {
        ...orderData,
        customer: customerId,
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(orderWithCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders?where[customer][equals]=${userId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const result = await response.json();
      return result.docs || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async getOrderById(orderId: number): Promise<Order | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }
}

export const orderService = new OrderService();
export default orderService;

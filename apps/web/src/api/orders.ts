import wretch from 'wretch';
import { Order } from '@repo/cms-types';
import { getBaseUrl } from '@/utils/url';
import { getCurrentUser } from './users';
import authService from './auth';

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

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  const baseUrl = getBaseUrl();

  try {
    // Get current user data to include as customer
    const currentUser = await getCurrentUser();

    const orderWithCustomer = {
      ...orderData,
      customer: currentUser.user.id,
    };

    const result = await wretch(`${baseUrl}/cms/orders`)
      .headers(authService.getAuthHeaders())
      .post(orderWithCustomer)
      .json<Order>();

    return result;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: number): Promise<Order[]> => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/orders?where[customer][equals]=${userId}`)
      .headers(authService.getAuthHeaders())
      .get()
      .json<{ docs: Order[] }>();

    return result.docs || [];
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    return [];
  }
};

export const getCurrentUserOrders = async (): Promise<Order[]> => {
  const baseUrl = getBaseUrl();

  try {
    // Get current user data to fetch their orders
    const currentUser = await getCurrentUser();

    const result = await wretch(
      `${baseUrl}/cms/orders?where[customer][equals]=${currentUser.user.id}`,
    )
      .headers(authService.getAuthHeaders())
      .get()
      .json<{ docs: Order[] }>();

    return result.docs || [];
  } catch (error) {
    console.error('Failed to fetch current user orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/orders/${orderId}`)
      .headers(authService.getAuthHeaders())
      .get()
      .json<Order>();

    return result;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

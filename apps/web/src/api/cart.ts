import wretch from 'wretch';
import { Cart } from '@repo/cms-types';
import { getBaseUrl } from '@/utils/url';

export const getUserCart = async (userId: number): Promise<Cart | null> => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/cart?userId=${userId}`).get().json<Cart>();

    return result;
  } catch (error) {
    console.error('Failed to fetch user cart:', error);
    return null;
  }
};

export const addToCart = async (userId: number, productId: number, quantity: number = 1) => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/cart`)
      .post({
        userId,
        productId,
        quantity,
      })
      .json<Cart>();

    return result;
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (userId: number, productId: number) => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/cart?userId=${userId}&productId=${productId}`)
      .delete()
      .json<Cart>();

    return result;
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (
  userId: number,
  productId: number,
  quantity: number,
) => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/cart`)
      .patch({
        userId,
        productId,
        quantity,
      })
      .json<Cart>();

    return result;
  } catch (error) {
    console.error('Failed to update cart item quantity:', error);
    throw error;
  }
};

export const clearCart = async (userId: number) => {
  const baseUrl = getBaseUrl();

  try {
    const result = await wretch(`${baseUrl}/cms/cart?userId=${userId}`).delete().json<Cart>();

    return result;
  } catch (error) {
    console.error('Failed to clear cart:', error);
    throw error;
  }
};

import type { Payload } from 'payload';

export const getOrCreateUserCart = async (payload: Payload, userId: string | number) => {
  try {
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const existingCart = await payload.find({
      collection: 'cart',
      where: {
        user: {
          equals: numericUserId,
        },
      },
      limit: 1,
    });

    if (existingCart.docs.length > 0) {
      return existingCart.docs[0];
    }

    const cart = await payload.create({
      collection: 'cart',
      data: {
        user: typeof userId === 'string' ? parseInt(userId, 10) : userId,
        items: [],
        totalAmount: 0,
        itemCount: 0,
      },
    });

    return cart;
  } catch (error) {
    payload.logger.error(`Failed to get or create cart for user ${userId}:`, error);
    throw error;
  }
};

import configPromise from '@payload-config';
import { getPayload, Payload } from 'payload';
import { getOrCreateUserCart } from '../../../utils/cart';

type CartItem = {
  product: number | { id: number };
  quantity: number;
  unitPrice: number;
  id?: string | null;
};

// Helper functions
const getPayloadInstance = () => getPayload({ config: configPromise });

const validateUserId = (userId: string | null) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  return parseInt(userId, 10);
};

const findItemIndex = (items: CartItem[], productId: number) => {
  return items.findIndex(
    (item) =>
      item.product === productId ||
      (typeof item.product === 'object' && item.product?.id === productId),
  );
};

const updateCart = async (payload: Payload, cartId: number, items: CartItem[]) => {
  return payload.update({
    collection: 'cart',
    id: cartId,
    data: { items },
  });
};

const handleError = (error: unknown, message: string, status = 500) => {
  console.error(`${message}:`, error);
  const errorMessage = error instanceof Error ? error.message : message;
  return Response.json({ error: errorMessage }, { status });
};

export const GET = async (request: Request) => {
  try {
    const payload = await getPayloadInstance();
    const url = new URL(request.url);
    const userId = validateUserId(url.searchParams.get('userId'));
    const cart = await getOrCreateUserCart(payload, userId);

    return Response.json(cart);
  } catch (error) {
    return handleError(error, 'Failed to fetch cart', 400);
  }
};

export const POST = async (request: Request) => {
  try {
    const payload = await getPayloadInstance();
    const { userId, productId, quantity = 1 } = await request.json();

    if (!userId || !productId) {
      return Response.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }

    const cart = await getOrCreateUserCart(payload, userId);
    if (!cart) {
      return Response.json({ error: 'Failed to get or create cart' }, { status: 500 });
    }

    const items = [...(cart.items || [])];
    const existingIndex = findItemIndex(items, productId);

    if (existingIndex > -1 && items[existingIndex]) {
      // Add to existing quantity
      const existingItem = items[existingIndex];
      items[existingIndex] = {
        product: existingItem.product,
        quantity: existingItem.quantity + quantity,
        unitPrice: existingItem.unitPrice,
        id: existingItem.id,
      };
    } else {
      // Add new item
      const product = await payload.findByID({ collection: 'products', id: productId });
      items.push({ product: productId, quantity, unitPrice: product.price });
    }

    const updatedCart = await updateCart(payload, cart.id, items);
    return Response.json(updatedCart);
  } catch (error) {
    return handleError(error, 'Failed to add item to cart');
  }
};

export const PATCH = async (request: Request) => {
  try {
    const payload = await getPayloadInstance();
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || quantity === undefined) {
      return Response.json(
        { error: 'User ID, Product ID, and quantity are required' },
        { status: 400 },
      );
    }

    const cart = await getOrCreateUserCart(payload, userId);
    if (!cart) {
      return Response.json({ error: 'Failed to get or create cart' }, { status: 500 });
    }

    const items = [...(cart.items || [])];
    const existingIndex = findItemIndex(items, productId);

    if (existingIndex > -1 && items[existingIndex]) {
      if (quantity <= 0) {
        items.splice(existingIndex, 1); // Remove item
      } else {
        const existingItem = items[existingIndex];
        items[existingIndex] = {
          product: existingItem.product,
          quantity,
          unitPrice: existingItem.unitPrice,
          id: existingItem.id,
        };
      }
    }

    const updatedCart = await updateCart(payload, cart.id, items);
    return Response.json(updatedCart);
  } catch (error) {
    return handleError(error, 'Failed to update cart item');
  }
};

export const DELETE = async (request: Request) => {
  try {
    const payload = await getPayloadInstance();
    const url = new URL(request.url);
    const userId = validateUserId(url.searchParams.get('userId'));
    const productId = url.searchParams.get('productId');

    const cart = await getOrCreateUserCart(payload, userId);
    if (!cart) {
      return Response.json({ error: 'Failed to get or create cart' }, { status: 500 });
    }

    let items: CartItem[];
    if (productId) {
      // Remove specific item
      items =
        cart.items?.filter(
          (item: CartItem) =>
            item.product !== parseInt(productId, 10) &&
            (typeof item.product !== 'object' || item.product?.id !== parseInt(productId, 10)),
        ) || [];
    } else {
      // Clear entire cart
      items = [];
    }

    const updatedCart = await updateCart(payload, cart.id, items);
    return Response.json(updatedCart);
  } catch (error) {
    return handleError(error, 'Failed to remove from cart', 400);
  }
};

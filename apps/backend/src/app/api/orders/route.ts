import configPromise from '@payload-config';
import { getPayload } from 'payload';

// Helper functions
const getPayloadInstance = () => getPayload({ config: configPromise });

const handleError = (error: unknown, message: string, status = 500) => {
  console.error(`${message}:`, error);
  const errorMessage = error instanceof Error ? error.message : message;
  return Response.json({ error: errorMessage }, { status });
};

export const GET = async (request: Request) => {
  try {
    const payload = await getPayloadInstance();
    const url = new URL(request.url);

    // Check if it's a request for a specific order by ID
    const pathParts = url.pathname.split('/');
    const orderId = pathParts[pathParts.length - 1];

    if (orderId && orderId !== 'orders' && !isNaN(Number(orderId))) {
      // Get specific order by ID
      const order = await payload.findByID({
        collection: 'orders',
        id: parseInt(orderId, 10),
      });
      return Response.json(order);
    }

    // Get orders with query parameters
    const customerId = url.searchParams.get('where[customer][equals]');

    if (customerId) {
      const orders = await payload.find({
        collection: 'orders',
        where: {
          customer: {
            equals: parseInt(customerId, 10),
          },
        },
        sort: '-createdAt', // Sort by newest first
      });
      return Response.json(orders);
    }

    // Default: get all orders (admin only)
    const orders = await payload.find({
      collection: 'orders',
      sort: '-createdAt',
    });

    return Response.json(orders);
  } catch (error) {
    return handleError(error, 'Failed to fetch orders', 400);
  }
};

export const POST = async (request: Request) => {
  try {
    const payload = await getPayloadInstance();
    const orderData = await request.json();

    if (!orderData.customer) {
      return Response.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    if (!orderData.items || orderData.items.length === 0) {
      return Response.json({ error: 'Order items are required' }, { status: 400 });
    }

    if (!orderData.shippingAddress) {
      return Response.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    // Validate shipping address fields
    const { firstName, lastName, address, city, zipCode } = orderData.shippingAddress;
    if (!firstName || !lastName || !address || !city || !zipCode) {
      return Response.json(
        {
          error: 'All shipping address fields are required',
        },
        { status: 400 },
      );
    }

    // Create the order
    const order = await payload.create({
      collection: 'orders',
      data: orderData,
    });

    return Response.json(order);
  } catch (error) {
    return handleError(error, 'Failed to create order');
  }
};

'use client';
import { getUserCart, removeFromCart, updateCartItemQuantity } from '@/api/cart';
import { Button, Card, CardBody, CardHeader, Spinner, Divider, Input, Image } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2Icon } from 'lucide-react';
import { getImageUrl } from '@/utils/image';
import type { Cart } from '@repo/cms-types';

interface CheckoutProps {
  userId: number;
}

export const Checkout = ({ userId }: CheckoutProps) => {
  const queryClient = useQueryClient();

  const { data: cart } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => getUserCart(userId),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: number; productId: number }) =>
      removeFromCart(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({
      userId,
      productId,
      quantity,
    }: {
      userId: number;
      productId: number;
      quantity: number;
    }) => updateCartItemQuantity(userId, productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const handleDelete = (productId: number) => {
    if (cart?.items && cart.items.length <= 1) {
      window.location.href = '/';
      return;
    }

    removeFromCartMutation.mutate({
      userId,
      productId,
    });
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantityMutation.mutate({
      userId,
      productId,
      quantity: newQuantity,
    });
  };

  if (!cart) {
    return (
      <div className="max-w-5xl self-center w-full flex flex-col gap-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <Card>
          <CardBody>
            <Spinner />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-5xl self-center w-full flex flex-col gap-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-lg text-default-500">Your cart is empty</p>
              <Button color="primary" className="mt-4" onPress={() => (window.location.href = '/')}>
                Continue Shopping
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl self-center w-full flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Order Summary</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <ProductItem
                  key={typeof item.product === 'number' ? item.product : item.product.id}
                  item={item}
                  onDelete={() =>
                    handleDelete(typeof item.product === 'number' ? item.product : item.product.id)
                  }
                  onQuantityChange={(newQuantity) =>
                    handleQuantityChange(
                      typeof item.product === 'number' ? item.product : item.product.id,
                      newQuantity,
                    )
                  }
                />
              ))}
            </div>
            <Divider />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${cart.totalAmount}</span>
            </div>
            <div className="mt-2 text-xs text-default-500">
              Estimated delivery: 2-4 business days
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Shipping Information</h2>
        </CardHeader>
        <CardBody>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Enter your first name" />
              <Input label="Last Name" placeholder="Enter your last name" />
            </div>
            <Input label="Address" placeholder="Enter your street address" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="City" placeholder="Enter your city" />
              <Input label="ZIP Code" placeholder="Enter your ZIP code" />
            </div>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Submit</h2>
        </CardHeader>
        <CardBody>
          <Button color="primary" className="w-full">
            Place Order
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default Checkout;

interface ProductItemProps {
  item: NonNullable<Cart['items']>[number];
  onDelete: () => void;
  onQuantityChange: (newQuantity: number) => void;
}

function ProductItem({ item, onDelete, onQuantityChange }: ProductItemProps) {
  const product = typeof item.product === 'number' ? null : item.product;

  if (!product) {
    return null;
  }

  const productImage = product.images?.[0];

  return (
    <div className="flex items-center space-x-4">
      <Image
        src={productImage ? getImageUrl(productImage) : '/placeholder-product.jpg'}
        alt={product.name}
        className="w-16 h-16 object-cover rounded-md"
      />
      <div className="flex-grow">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-default-500">Qty:</span>
          <Input
            type="number"
            value={item.quantity.toString()}
            onValueChange={(val: string) => {
              const num = parseInt(val, 10);
              if (!isNaN(num) && num > 0) {
                onQuantityChange(num);
              }
            }}
            className="w-16"
            size="sm"
            min={1}
          />
        </div>
      </div>
      <span className="text-sm font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
      <Button
        isIconOnly
        color="danger"
        variant="light"
        size="sm"
        onPress={onDelete}
        aria-label={`Delete ${product.name}`}
      >
        <Trash2Icon className="w-4 h-4" />
      </Button>
    </div>
  );
}

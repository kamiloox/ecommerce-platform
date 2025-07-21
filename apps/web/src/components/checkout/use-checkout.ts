import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '@/api/orders';
import { removeFromCart, updateCartItemQuantity, clearCart } from '@/api/cart';
import type { Cart } from '@repo/cms-types';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
}

interface UseCheckoutProps {
  userId: number;
  cart: Cart | undefined;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const useCheckout = ({ userId, cart, onSuccess, onError }: UseCheckoutProps) => {
  const queryClient = useQueryClient();
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

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

  const updateShippingInfo = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShippingInfo = (): boolean => {
    return Boolean(
      shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.zipCode
    );
  };

  const handlePlaceOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return;
    }

    if (!validateShippingInfo()) {
      onError('Please fill in all shipping information');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        items: cart.items.map(item => {
          const productId = typeof item.product === 'number' ? item.product : item.product.id;
          return {
            product: productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        }),
        shippingAddress: shippingInfo,
      };

      // Create the order
      await createOrder(orderData);
      
      // Clear the cart after successful order creation
      await clearCart(userId);
      
      // Invalidate cart query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      
      // Reset shipping form
      setShippingInfo({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zipCode: '',
      });
      
      // Mark order as completed
      setOrderCompleted(true);
      
      onSuccess();
      
    } catch (error) {
      console.error('Failed to place order:', error);
      onError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    shippingInfo,
    isSubmitting,
    orderCompleted,
    handleDelete,
    handleQuantityChange,
    updateShippingInfo,
    handlePlaceOrder,
  };
};

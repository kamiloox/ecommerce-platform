'use client';
import { getUserCart } from '@/api/cart';
import { useQuery } from '@tanstack/react-query';
import { OrderSummary } from './order-summary';
import { ShippingForm } from './shipping-form';
import { OrderSubmit } from './order-submit';
import { EmptyCart, LoadingCard } from './checkout-states';
import { Notification, useNotification } from './notification';
import { useCheckout } from './use-checkout';

interface CheckoutProps {
  userId: number;
}

export const Checkout = ({ userId }: CheckoutProps) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const { data: cart } = useQuery({
    queryKey: ['cart', userId],
    queryFn: () => getUserCart(userId),
  });

  const {
    shippingInfo,
    isSubmitting,
    orderCompleted,
    handleDelete,
    handleQuantityChange,
    updateShippingInfo,
    handlePlaceOrder,
  } = useCheckout({
    userId,
    cart: cart || undefined,
    onSuccess: () => showSuccess('🎉 Order placed successfully! Your cart has been cleared and you will receive a confirmation email shortly.'),
    onError: showError,
  });

  const handleContinueShopping = () => {
    window.location.href = '/';
  };

  if (!cart) {
    return (
      <div className="max-w-5xl self-center w-full flex flex-col gap-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <LoadingCard />
        <Notification {...notification} onClose={hideNotification} />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-5xl self-center w-full flex flex-col gap-8">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <EmptyCart 
          onContinueShopping={handleContinueShopping} 
          isOrderCompleted={orderCompleted}
        />
        <Notification {...notification} onClose={hideNotification} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl self-center w-full flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      
      <OrderSummary
        cart={cart}
        onDelete={handleDelete}
        onQuantityChange={handleQuantityChange}
      />
      
      <ShippingForm
        shippingInfo={shippingInfo}
        onChange={updateShippingInfo}
      />
      
      <OrderSubmit
        isSubmitting={isSubmitting}
        hasItems={Boolean(cart.items?.length)}
        onSubmit={handlePlaceOrder}
      />
      
      <Notification {...notification} onClose={hideNotification} />
    </div>
  );
};

export default Checkout;

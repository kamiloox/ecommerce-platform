'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, Button, Image, Chip } from '@heroui/react';
import { MinusIcon, PlusIcon, Trash2Icon, ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@repo/cms-types';

const CartPage = () => {
  const { cart, isLoading, removeItem, updateQuantity, clearCartItems } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-sm border-b p-4 mb-6">
          <h1 className="text-xl font-semibold text-center">Cart</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-8">
          <ShoppingCartIcon size={64} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cart</h2>
          <p className="text-gray-600 text-center mb-6">Please log in to view your cart.</p>
          <Link href="/login">
            <Button color="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-sm border-b p-4 mb-6">
          <h1 className="text-xl font-semibold text-center">Cart</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-sm border-b p-4 mb-6">
          <h1 className="text-xl font-semibold text-center">Cart</h1>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-8">
          <ShoppingCartIcon size={64} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 text-center mb-6">Add some products to get started!</p>
          <Link href="/">
            <Button color="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="w-full pb-6">
      <div className="bg-white shadow-sm border-b p-4 mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cart</h1>
        <Chip color="primary" variant="flat" size="sm">
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
        </Chip>
      </div>

      <div className="px-4 space-y-4 max-w-4xl mx-auto">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.items &&
            cart.items.map((item) => {
              const product = item.product as Product;
              return (
                <Card key={item.id} className="shadow-sm">
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      {product.images?.[0] && (
                        <Image
                          src={
                            typeof product.images[0].image === 'object'
                              ? product.images[0].image.url || ''
                              : `/uploads/${product.images[0].image}`
                          }
                          alt={product.images[0].alt || product.name}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                        <p className="text-gray-600 text-sm">${item.unitPrice.toFixed(2)}</p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              onClick={() =>
                                handleQuantityChange(
                                  typeof product === 'object' ? product.id : Number(product),
                                  item.quantity - 1,
                                )
                              }
                            >
                              <MinusIcon size={14} />
                            </Button>

                            <span className="font-medium text-sm min-w-[2rem] text-center">
                              {item.quantity}
                            </span>

                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              onClick={() =>
                                handleQuantityChange(
                                  typeof product === 'object' ? product.id : Number(product),
                                  item.quantity + 1,
                                )
                              }
                            >
                              <PlusIcon size={14} />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              isIconOnly
                              onClick={() =>
                                removeItem(
                                  typeof product === 'object' ? product.id : Number(product),
                                )
                              }
                            >
                              <Trash2Icon size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
        </div>

        {/* Order Summary */}
        <Card className="shadow-sm">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/checkout" className="block">
                <Button color="primary" className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Button variant="light" color="danger" className="w-full" onClick={clearCartItems}>
                Clear Cart
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;

import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import type { Cart } from '@repo/cms-types';
import { ProductItem } from './product-item';

interface OrderSummaryProps {
  cart: Cart;
  onDelete: (productId: number) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
}

export const OrderSummary = ({ cart, onDelete, onQuantityChange }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="space-y-3">
            {cart.items?.map((item) => (
              <ProductItem
                key={typeof item.product === 'number' ? item.product : item.product.id}
                item={item}
                onDelete={() =>
                  onDelete(typeof item.product === 'number' ? item.product : item.product.id)
                }
                onQuantityChange={(newQuantity: number) =>
                  onQuantityChange(
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
  );
};

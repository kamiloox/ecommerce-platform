import { Button, Image, Input } from '@heroui/react';
import { Trash2Icon } from 'lucide-react';
import type { Cart } from '@repo/cms-types';
import { getImageUrl } from '@/utils/image';

interface ProductItemProps {
  item: NonNullable<Cart['items']>[number];
  onDelete: () => void;
  onQuantityChange: (newQuantity: number) => void;
}

export const ProductItem = ({ item, onDelete, onQuantityChange }: ProductItemProps) => {
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
};

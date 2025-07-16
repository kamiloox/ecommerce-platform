'use client';

import React from 'react';
import { Button, Input, Image, Chip } from '@heroui/react';
import { TruckIcon, RepeatIcon, ShieldCheckIcon, ShoppingCartIcon } from 'lucide-react';
import { RichText, defaultJSXConverters } from '@payloadcms/richtext-lexical/react';
import { getImageUrl } from '@/utils/image';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getProduct } from '@/api/products';

interface ProductDetailsProps {
  slug: string;
}

export const ProductDetails = ({ slug }: ProductDetailsProps) => {
  const { data } = useSuspenseQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct({ slug }),
  });

  const [quantity, setQuantity] = React.useState(1);

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  if (!data) {
    return <div>Product not found</div>;
  }

  const { name, images, price, compareAtPrice, description, tags } = data;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {images?.[0] && (
            <Image
              alt="Premium Wireless Headphones"
              className="w-full object-cover rounded-lg"
              src={getImageUrl(images?.[0])}
            />
          )}
          {(images || [])?.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images?.map((image) => {
                return (
                  <Image
                    key={image.id}
                    alt={image.alt || 'Product Image'}
                    className="w-full object-cover rounded-lg"
                    src={getImageUrl(image)}
                  />
                );
              })}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{name}</h1>
            {(tags || [])?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags?.map(({ tag, id }) => (
                  <Chip key={id} color="primary" variant="flat">
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">${price}</span>
                {compareAtPrice && (
                  <span className="text-xl text-default-400 line-through">${compareAtPrice}</span>
                )}
              </div>
              {compareAtPrice && price < compareAtPrice && (
                <p className="text-success-500 font-semibold">
                  Save ${compareAtPrice - price} (
                  {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% off)
                </p>
              )}
            </div>

            {description && (
              <div className="text-foreground-700">
                <RichText converters={defaultJSXConverters} data={description} />
              </div>
            )}

            <div className="flex items-center gap-4">
              <Input
                type="number"
                label="Quantity"
                value={quantity.toString()}
                onValueChange={handleQuantityChange}
                min={1}
                className="w-24"
              />
              <Button color="primary" className="flex-grow">
                <ShoppingCartIcon className="mr-2" />
                Add to Cart
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TruckIcon className="text-primary" />
                <span>Free shipping on orders over $500</span>
              </div>
              <div className="flex items-center gap-2">
                <RepeatIcon className="text-primary" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="text-primary" />
                <span>2-year warranty included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

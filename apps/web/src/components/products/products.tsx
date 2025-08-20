'use client';
import { ProductsResult } from '@repo/cms-types';
import { getManyProducts } from '@/lib/api';
import { getImageUrl } from '@/utils/image';
import { Card, CardBody, CardFooter, Image, Button } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';

interface ProductsProps {
  page: number;
}

export const Products = ({ page }: ProductsProps) => {
  const { data } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getManyProducts({ page }),
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data?.docs.map((product) => {
        const image = product.images?.[0];

        return (
          <Link key={product.id} href={`/offer/${product.slug}`}>
            <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardBody className="p-0">
                <Image
                  alt={product.name}
                  className="w-full h-[300px] object-cover"
                  src={image ? getImageUrl(image) : ''}
                  removeWrapper
                />
              </CardBody>
              <CardFooter className="flex flex-col items-start">
                <div className="flex justify-between items-center w-full mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-default-500 font-medium">${product.price.toFixed(2)}</p>
                </div>
                <Button
                  color="primary"
                  variant="solid"
                  radius="full"
                  size="md"
                  startContent={<ShoppingCartIcon size={16} />}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

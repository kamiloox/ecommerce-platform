import React from 'react';
import { Card, CardBody, CardFooter, Image, Button, Pagination } from '@heroui/react';
import { ShoppingCartIcon } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Leather Backpack',
    price: 89.99,
    image: 'https://img.heroui.chat/image/fashion?w=300&h=400&u=1',
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    price: 129.99,
    image: 'https://img.heroui.chat/image/fashion?w=300&h=400&u=2',
  },
  {
    id: 3,
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://img.heroui.chat/image/fashion?w=300&h=400&u=3',
  },
  {
    id: 4,
    name: 'Sunglasses',
    price: 59.99,
    image: 'https://img.heroui.chat/image/fashion?w=300&h=400&u=4',
  },
  {
    id: 5,
    name: 'Running Shoes',
    price: 119.99,
    image: 'https://img.heroui.chat/image/shoes?w=300&h=400&u=5',
  },
  {
    id: 6,
    name: 'Denim Jacket',
    price: 79.99,
    image: 'https://img.heroui.chat/image/fashion?w=300&h=400&u=6',
  },
];

const ProductList = () => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="w-full">
            <CardBody className="p-0">
              <Image
                alt={product.name}
                className="w-full h-[300px] object-cover"
                src={product.image}
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
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Pagination total={10} initialPage={1} />
      </div>
    </>
  );
};

export default ProductList;

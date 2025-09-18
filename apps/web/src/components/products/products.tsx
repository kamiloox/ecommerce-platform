'use client';
import { getManyProducts } from '@/lib/api';
import { getImageUrl } from '@/utils/image';
import { Card, CardBody, CardFooter, Image, Button, addToast } from '@heroui/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/api/cart';
import { getCurrentUser } from '@/api/users';

interface ProductsProps {
  page: number;
}

export const Products = ({ page }: ProductsProps) => {
  const { data } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getManyProducts({ page }),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const { mutate: addProductToCart } = useMutation({
    mutationFn: ({
      userId,
      productId,
      quantity,
    }: {
      userId: number;
      productId: number;
      quantity: number;
    }) => addToCart(userId, productId, quantity),
    onSuccess: () => {
      addToast({
        title: '🛒 Product added to cart successfully!',
        color: 'success',
      });
    },
    onError: () => {
      addToast({
        title: '❌ Failed to add product to cart. Please try again.',
        color: 'danger',
      });
    },
  });

  const handleAddToCart = (productId: number, productName: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to product details
    event.stopPropagation();

    if (!isAuthenticated || !currentUser?.user?.id) {
      addToast({
        title: '🔒 Please sign in to add items to your cart',
        color: 'warning',
      });

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }

    addProductToCart({ userId: currentUser.user.id, productId, quantity: 1 });
  };

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
                  onClick={(event) => handleAddToCart(product.id, product.name, event)}
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

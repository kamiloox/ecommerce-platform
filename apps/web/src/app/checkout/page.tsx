'use client';

import { getCurrentUser } from '@/api/users';
import Checkout from '@/components/checkout/checkout';
import { useSuspenseQuery } from '@tanstack/react-query';

const CheckoutPage = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  if (!data || !data.user) {
    return;
  }

  return <Checkout userId={data.user.id} />;
};

export default CheckoutPage;

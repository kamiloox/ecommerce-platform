'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserOrders } from '@/api/orders';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { PackageIcon } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@repo/cms-types';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const userOrders = await getCurrentUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full pb-6">
        <div className="space-y-4 px-4 max-w-4xl mx-auto pt-8">
          <Card className="shadow-lg">
            <CardBody className="text-center py-16">
              <PackageIcon size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order History</h2>
              <p className="text-gray-600 mb-6">Please log in to view your orders.</p>
              <Link href="/login">
                <Button color="primary">Sign In</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-6">
      <div className="space-y-4 px-4 max-w-4xl mx-auto pt-8">
        {/* Page Title Card */}
        <Card className="shadow-lg">
          <CardBody className="text-center py-6">
            <PackageIcon size={48} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-semibold mb-1">Order History</h1>
            <p className="text-gray-600">Track your orders and view past purchases</p>
          </CardBody>
        </Card>

        {/* Orders Content */}
        {isLoading ? (
          <Card className="shadow-lg">
            <CardBody className="text-center py-8">
              <p className="text-gray-600">Loading orders...</p>
            </CardBody>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="shadow-lg">
            <CardBody className="text-center py-16">
              <PackageIcon size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">When you place orders, they&apos;ll appear here</p>
              <Link href="/">
                <Button color="primary">Start Shopping</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-lg">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Chip
                        color={getStatusColor(order.status || 'pending')}
                        variant="flat"
                        size="sm"
                        className="mb-2"
                      >
                        {order.status || 'pending'}
                      </Chip>
                      <p className="font-semibold text-lg">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {order.shippingAddress && (
                      <>
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Shipping Address:
                          </p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium">
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

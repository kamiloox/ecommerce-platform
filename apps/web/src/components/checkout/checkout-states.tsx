import { Card, CardBody, Spinner, Button } from '@heroui/react';

interface EmptyCartProps {
  onContinueShopping: () => void;
  isOrderCompleted?: boolean;
}

export const EmptyCart = ({ onContinueShopping, isOrderCompleted = false }: EmptyCartProps) => {
  return (
    <Card>
      <CardBody>
        <div className="text-center py-8">
          {isOrderCompleted ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg font-semibold text-success-600 mb-2">Order Completed Successfully!</p>
              <p className="text-default-500 mb-4">
                Thank you for your purchase. You will receive a confirmation email shortly.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-default-500 mb-4">Your cart is empty</p>
            </>
          )}
          <Button color="primary" onPress={onContinueShopping}>
            Continue Shopping
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const LoadingCard = () => {
  return (
    <Card>
      <CardBody>
        <Spinner />
      </CardBody>
    </Card>
  );
};

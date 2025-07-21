import { Card, CardBody, CardHeader, Button } from '@heroui/react';

interface OrderSubmitProps {
  isSubmitting: boolean;
  hasItems: boolean;
  onSubmit: () => void;
}

export const OrderSubmit = ({ isSubmitting, hasItems, onSubmit }: OrderSubmitProps) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Submit</h2>
      </CardHeader>
      <CardBody>
        <Button 
          color="primary" 
          className="w-full"
          onPress={onSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting || !hasItems}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </CardBody>
    </Card>
  );
};

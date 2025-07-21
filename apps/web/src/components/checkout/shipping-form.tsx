import { Card, CardBody, CardHeader, Input } from '@heroui/react';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
}

interface ShippingFormProps {
  shippingInfo: ShippingInfo;
  onChange: (field: keyof ShippingInfo, value: string) => void;
}

export const ShippingForm = ({ shippingInfo, onChange }: ShippingFormProps) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Shipping Information</h2>
      </CardHeader>
      <CardBody>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              placeholder="Enter your first name"
              value={shippingInfo.firstName}
              onValueChange={(value) => onChange('firstName', value)}
              required
            />
            <Input 
              label="Last Name" 
              placeholder="Enter your last name"
              value={shippingInfo.lastName}
              onValueChange={(value) => onChange('lastName', value)}
              required
            />
          </div>
          <Input 
            label="Address" 
            placeholder="Enter your street address"
            value={shippingInfo.address}
            onValueChange={(value) => onChange('address', value)}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="City" 
              placeholder="Enter your city"
              value={shippingInfo.city}
              onValueChange={(value) => onChange('city', value)}
              required
            />
            <Input 
              label="ZIP Code" 
              placeholder="Enter your ZIP code"
              value={shippingInfo.zipCode}
              onValueChange={(value) => onChange('zipCode', value)}
              required
            />
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

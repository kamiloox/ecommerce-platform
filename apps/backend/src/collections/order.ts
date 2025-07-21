import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'totalAmount', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return {
          customer: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Order Number',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              const date = new Date();
              const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
              const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
              return `ORD-${dateStr}-${random}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Customer',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Order Items',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Product',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          label: 'Quantity',
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            step: 0.01,
          },
          label: 'Unit Price',
        },
      ],
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        step: 0.01,
        readOnly: true,
      },
      label: 'Total Amount',
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.items?.length) {
              return data.items.reduce(
                (sum: number, item: { quantity?: number; unitPrice?: number }) => {
                  const quantity = item.quantity || 0;
                  const unitPrice = item.unitPrice || 0;
                  return sum + quantity * unitPrice;
                },
                0,
              );
            }
            return 0;
          },
        ],
      },
    },
    {
      name: 'shippingAddress',
      type: 'group',
      label: 'Shipping Address',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          label: 'First Name',
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          label: 'Last Name',
        },
        {
          name: 'address',
          type: 'text',
          required: true,
          label: 'Address',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'City',
        },
        {
          name: 'zipCode',
          type: 'text',
          required: true,
          label: 'ZIP Code',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.items?.length) {
          const totalAmount = data.items.reduce(
            (sum: number, item: { quantity?: number; unitPrice?: number }) => {
              const quantity = item.quantity || 0;
              const unitPrice = item.unitPrice || 0;
              return sum + quantity * unitPrice;
            },
            0,
          );
          data.totalAmount = totalAmount;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

import type { CollectionConfig } from 'payload';

export const Cart: CollectionConfig = {
  slug: 'cart',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['user', 'totalAmount', 'itemCount', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        };
      }
      return false;
    },
    delete: ({ req: { user } }) => {
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        };
      }
      return false;
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true, // Each user can have only one cart
      label: 'Customer',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Cart Items',
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
          defaultValue: 1,
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
      defaultValue: 0,
      admin: {
        step: 0.01,
        readOnly: true,
      },
      label: 'Total Amount',
    },
    {
      name: 'itemCount',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
      label: 'Item Count',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Calculate totals
        if (data.items && Array.isArray(data.items)) {
          let totalAmount = 0;
          let itemCount = 0;

          data.items.forEach((item: { quantity: number; unitPrice: number }) => {
            const itemTotal = item.quantity * item.unitPrice;
            totalAmount += itemTotal;
            itemCount += item.quantity;
          });

          data.totalAmount = totalAmount;
          data.itemCount = itemCount;
        } else {
          data.totalAmount = 0;
          data.itemCount = 0;
        }

        return data;
      },
    ],
  },
  timestamps: true,
};

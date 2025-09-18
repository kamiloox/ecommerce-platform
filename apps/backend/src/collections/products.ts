import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'status', 'updatedAt'],
  },
  access: {
    read: () => true, // Public read access for products
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Product Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'URL-friendly version of the product name',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Product Description',
      admin: {
        description: 'Detailed product description with rich text formatting',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: 'Brief product summary for listings and previews',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alternative Text',
          admin: {
            description: 'Accessibility text for the image',
          },
        },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      label: 'Price',
      admin: {
        step: 0.01,
        description: 'Product price in base currency',
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      label: 'Compare at Price',
      admin: {
        step: 0.01,
        description: 'Original price (for showing discounts)',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity',
      min: 0,
      defaultValue: 0,
      admin: {
        step: 1,
        description: 'Available stock quantity for the product',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for search and filtering',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'SEO Title',
          admin: {
            description: 'Title tag for search engines',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Description for search engine results',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Keywords',
          admin: {
            description: 'Comma-separated keywords for SEO',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
      admin: {
        description: 'Product visibility status',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Product',
      admin: {
        description: 'Mark as featured for homepage or special sections',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug if not provided
        if (!data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

import { Product } from '@repo/cms-types';

type Image = NonNullable<Product['images']>[number];

export const getImageUrl = ({ image }: Image) => {
  if (typeof image === 'object' && image?.url) {
    return image.url;
  }

  return undefined;
};

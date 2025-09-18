export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
};

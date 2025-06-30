export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080';
};

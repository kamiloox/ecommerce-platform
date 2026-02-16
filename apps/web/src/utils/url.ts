export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side rendering during build
  return 'http://localhost:3000';
};

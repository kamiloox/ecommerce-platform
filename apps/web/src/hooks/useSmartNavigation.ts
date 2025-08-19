'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useSmartNavigation() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const navigateToProfile = () => {
    // Only navigate if auth state is settled
    if (!isLoading) {
      router.push('/profile');
    }
  };

  const navigateToLogin = () => {
    if (!isLoading) {
      router.push('/login');
    }
  };

  const navigateToRegister = () => {
    if (!isLoading) {
      router.push('/register');
    }
  };

  return {
    navigateToProfile,
    navigateToLogin,
    navigateToRegister,
    isReady: !isLoading,
    isAuthenticated,
  };
}

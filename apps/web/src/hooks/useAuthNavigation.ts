'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/profile');
      return;
    }

    if (!isAuthenticated && pathname === '/profile') {
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const navigateToAuth = (type: 'login' | 'register') => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push(`/${type}`);
    }
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  return {
    navigateToAuth,
    navigateToProfile,
    isOnAuthPage: pathname === '/login' || pathname === '/register',
    isOnProfilePage: pathname === '/profile',
  };
}

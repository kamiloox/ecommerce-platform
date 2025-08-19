'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect during loading to prevent flash
    if (isLoading) return;

    // If user is authenticated and trying to access auth pages, redirect to profile
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/profile');
      return;
    }

    // If user is not authenticated and trying to access protected pages
    if (!isAuthenticated && pathname === '/profile') {
      // Don't redirect automatically - let the profile page handle showing auth UI
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

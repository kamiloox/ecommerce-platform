'use client';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <HeroUIProvider>
            <ToastProvider />
            {children}
          </HeroUIProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

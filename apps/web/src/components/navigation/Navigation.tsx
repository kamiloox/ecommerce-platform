'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { ShoppingCartIcon, UserIcon, HomeIcon } from 'lucide-react';
import { Badge } from '@heroui/react';

export function Navigation() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { navigateToProfile, isReady } = useSmartNavigation();

  const hasValidStoredUser =
    typeof window !== 'undefined' &&
    (() => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!(parsed && typeof parsed === 'object' && typeof parsed.email === 'string');
      } catch {
        return false;
      }
    })();

  // Check for stored auth immediately to prevent navigation delays
  const hasStoredAuth =
    typeof window !== 'undefined' && !!localStorage.getItem('auth_token') && hasValidStoredUser;

  const navItems = [
    {
      name: 'Products',
      href: '/',
      icon: HomeIcon,
      isActive: pathname === '/',
      isLink: true,
    },
    ...(isAuthenticated || hasStoredAuth
      ? [
          {
            name: 'Cart',
            href: '/cart',
            icon: ShoppingCartIcon,
            isActive: pathname === '/cart',
            badge: itemCount > 0 ? itemCount : undefined,
            isLink: true,
          },
        ]
      : []),
    {
      name: isAuthenticated || hasStoredAuth ? 'Profile' : 'Account',
      href: '/profile',
      icon: UserIcon,
      isActive: pathname === '/profile' || pathname === '/login' || pathname === '/register',
      isLink: true, // Always use Link for immediate navigation
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const content = (
            <div
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                item.isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="relative">
                {item.badge ? (
                  <Badge content={item.badge} color="primary" size="sm">
                    <Icon size={24} />
                  </Badge>
                ) : (
                  <Icon size={24} />
                )}
              </div>
              <span className="mt-1">{item.name}</span>
            </div>
          );

          if (item.isLink) {
            return (
              <Link key={item.name} href={item.href}>
                {content}
              </Link>
            );
          } else {
            // This case should no longer be used, but keeping for safety
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (isReady) {
                    navigateToProfile();
                  }
                }}
                disabled={!isReady}
                className="cursor-pointer"
              >
                {content}
              </button>
            );
          }
        })}
      </div>
    </nav>
  );
}

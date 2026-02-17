'use client';
import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@heroui/react';
import { ShoppingBagIcon, ShoppingCartIcon, LockIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const { isAuthenticated } = useAuth();

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
  return (
    <Navbar isBordered>
      <NavbarBrand>
        <Link color="foreground" href="/">
          <ShoppingBagIcon className="text-primary text-2xl mr-2" />
          <p className="font-bold text-inherit">AJP Shop</p>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        {(isAuthenticated || hasStoredAuth) && (
          <NavbarItem>
            <Button
              as={Link}
              color="primary"
              href="/checkout"
              variant="flat"
              startContent={<ShoppingCartIcon />}
            >
              Cart
            </Button>
          </NavbarItem>
        )}
        <NavbarItem>
          <Button
            as={Link}
            color="secondary"
            href="/profile"
            variant="flat"
            startContent={isAuthenticated || hasStoredAuth ? <UserIcon /> : <LockIcon />}
          >
            {isAuthenticated || hasStoredAuth ? 'Profile' : 'Account'}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

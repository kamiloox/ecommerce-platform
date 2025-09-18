'use client';
import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@heroui/react';
import { ShoppingBagIcon, ShoppingCartIcon, LockIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  currentPath?: string;
}

export const Header = ({ currentPath }: HeaderProps) => {
  const { isAuthenticated } = useAuth();

  // Check for stored auth immediately to prevent navigation delays
  const hasStoredAuth =
    typeof window !== 'undefined' &&
    localStorage.getItem('auth_token') &&
    localStorage.getItem('auth_user');
  return (
    <Navbar isBordered>
      <NavbarBrand>
        <Link color="foreground" href="/">
          <ShoppingBagIcon className="text-primary text-2xl mr-2" />
          <p className="font-bold text-inherit">AJP Shop</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={currentPath === '/'}>
          <Link color="foreground" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem isActive={currentPath === '/products'}>
          <Link color="foreground" href="/products">
            Products
          </Link>
        </NavbarItem>
      </NavbarContent>
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

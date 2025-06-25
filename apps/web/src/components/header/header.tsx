'use client';
import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@heroui/react';
import { ShoppingBagIcon, ShoppingCartIcon, LockIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <ShoppingBagIcon className="text-primary text-2xl mr-2" />
        <p className="font-bold text-inherit">AJP Shop</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem isActive={pathname === '/'}>
          <Link color="foreground" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem isActive={pathname === '/products'}>
          <Link color="foreground" href="/products">
            Products
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            as={Link}
            color="primary"
            href="/cart"
            variant="flat"
            startContent={<ShoppingCartIcon />}
          >
            Cart
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            color="secondary"
            href="/login"
            variant="flat"
            startContent={<LockIcon />}
          >
            Account
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

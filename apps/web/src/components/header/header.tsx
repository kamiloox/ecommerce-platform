'use client';
import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from '@heroui/react';
import { ShoppingBagIcon, ShoppingCartIcon, LockIcon } from 'lucide-react';

interface HeaderProps {
  currentPath?: string;
}

export const Header = ({ currentPath }: HeaderProps) => {
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

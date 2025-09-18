import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '../../src/contexts/AuthContext';
import { cartService } from '../../src/services/api';
import { useEffect, useState } from 'react';
import { useCartContext } from '../../src/contexts/CartContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isAuthenticated } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const { setRefreshCartCount } = useCartContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated, user]);

  const loadCartCount = async () => {
    if (!user) return;
    try {
      const response = await cartService.getUserCart(user.id);
      setCartItemCount(response.data?.itemCount || 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  // Register the refresh function with the cart context
  useEffect(() => {
    setRefreshCartCount(loadCartCount);
  }, [user, isAuthenticated, setRefreshCartCount]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {isAuthenticated && (
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
            tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

import React, { createContext, useContext, useCallback } from 'react';

interface CartContextType {
  refreshCartCount: () => void;
  setRefreshCartCount: (refreshFn: () => void) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshCartCountFn, setRefreshCartCountFn] = React.useState<(() => void) | null>(null);

  const refreshCartCount = useCallback(() => {
    if (refreshCartCountFn) {
      refreshCartCountFn();
    }
  }, [refreshCartCountFn]);

  const setRefreshCartCount = useCallback((refreshFn: () => void) => {
    setRefreshCartCountFn(() => refreshFn);
  }, []);

  return (
    <CartContext.Provider value={{ refreshCartCount, setRefreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@repo/cms-types';
import { authService, LoginCredentials, RegisterCredentials, AuthResponse } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Set hydrated immediately
      setIsHydrated(true);

      // Initialize auth service and get stored data
      await authService.init();
      const storedUser = await authService.getUser();
      const storedToken = await authService.getToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setIsLoading(false);

        // Validate token in background
        try {
          const isValid = await authService.validateToken();
          if (!isValid) {
            setUser(null);
          }
        } catch (error) {
          console.error('Error validating stored token:', error);
          setUser(null);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setIsLoading(false);
      setIsHydrated(true);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const result = await authService.login(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const result = await authService.register(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getUser();
      if (currentUser) {
        const isValid = await authService.validateToken();
        if (isValid) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || !isHydrated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

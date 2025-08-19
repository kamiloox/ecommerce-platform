'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@repo/cms-types';
import authService, { LoginCredentials, RegisterCredentials, AuthResponse } from '../api/auth';

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
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from authService immediately
    if (typeof window !== 'undefined') {
      return authService.getUser();
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading if we truly don't have any data
    if (typeof window !== 'undefined') {
      const storedUser = authService.getUser();
      const storedToken = authService.getToken();
      return !(storedUser && storedToken);
    }
    return true;
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Set hydrated immediately
      setIsHydrated(true);

      // Get stored data
      const storedUser = authService.getUser();
      const storedToken = authService.getToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setIsLoading(false);

        // Validate token in background
        try {
          const refreshedUser = await authService.getCurrentUser();
          if (refreshedUser) {
            setUser(refreshedUser);
          } else {
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
      const refreshedUser = await authService.getCurrentUser();
      setUser(refreshedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!authService.getToken(),
    isLoading: isLoading || !isHydrated,
    login,
    register,
    logout,
    refreshUser,
  };

  // Show minimal loading during hydration to prevent flash - reduced to minimal time
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

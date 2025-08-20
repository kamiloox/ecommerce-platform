import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@repo/cms-types';
import { authService, LoginCredentials, RegisterCredentials, AuthResponse } from '../services/api';

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

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      await authService.init();

      // Check if we have a stored token and user
      const currentUser = await authService.getUser();
      if (currentUser && await authService.getToken()) {
        // Verify the token is still valid
        const isValid = await authService.validateToken();
        if (isValid) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await authService.register(credentials);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
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
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

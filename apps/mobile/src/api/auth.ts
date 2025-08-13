import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@repo/cms-types';

const API_BASE_URL = __DEV__ ? 'http://192.168.0.6:3000' : 'https://your-production-api.com';

const TOKEN_KEY = '@ecommerce_auth_token';
const USER_KEY = '@ecommerce_user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  passwordConfirm?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  exp?: number;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  async init() {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
      const userString = await AsyncStorage.getItem(USER_KEY);
      this.user = userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }

      // Store token and user data
      this.token = data.token;
      this.user = data.user;

      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        user: data.user,
        token: data.token,
        exp: data.exp,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed',
        };
      }

      // Auto-login after successful registration
      if (data.user) {
        return this.login({ email: credentials.email, password: credentials.password });
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      if (this.token) {
        await fetch(`${API_BASE_URL}/api/users/logout`, {
          method: 'POST',
          headers: {
            Authorization: `JWT ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error calling logout endpoint:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.token = null;
      this.user = null;
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `JWT ${this.token}`,
        },
      });

      if (!response.ok) {
        // Token might be expired, clear auth data
        await this.logout();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `JWT ${this.token}`;
    }

    return headers;
  }
}

export const authService = new AuthService();
export default authService;

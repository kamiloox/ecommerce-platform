import wretch from 'wretch';
import { User } from '@repo/cms-types';
import { getBaseUrl } from '@/utils/url';

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
  private initialized: boolean = false;

  constructor() {
    // Don't initialize during SSR
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;

    this.token = localStorage.getItem('auth_token');
    const userString = localStorage.getItem('auth_user');
    this.user = userString ? JSON.parse(userString) : null;
    this.initialized = true;
  }

  // Ensure initialization before any operation
  private ensureInitialized() {
    if (typeof window !== 'undefined' && !this.initialized) {
      this.init();
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const baseUrl = getBaseUrl();

    try {
      const response = await wretch(`${baseUrl}/cms/users/login`).post(credentials).json<{
        user: User;
        token: string;
        exp: number;
      }>();

      // Store token and user data
      this.token = response.token;
      this.user = response.user;

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }

      return {
        success: true,
        user: response.user,
        token: response.token,
        exp: response.exp,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const baseUrl = getBaseUrl();

    try {
      const response = await wretch(`${baseUrl}/cms/users`)
        .post(credentials)
        .json<{ user: User }>();

      // Auto-login after successful registration
      if (response.user) {
        return this.login({ email: credentials.email, password: credentials.password });
      }

      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async logout(): Promise<void> {
    const baseUrl = getBaseUrl();

    try {
      // Call logout endpoint if token exists
      if (this.token) {
        await wretch(`${baseUrl}/cms/users/logout`).auth(`JWT ${this.token}`).post().res();
      }
    } catch (error) {
      console.error('Error calling logout endpoint:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.token = null;
      this.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    const baseUrl = getBaseUrl();

    try {
      const response = await wretch(`${baseUrl}/cms/users/me`)
        .auth(`JWT ${this.token}`)
        .get()
        .json<{ user: User }>();

      this.user = response.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }

      return response.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Token might be expired, clear auth data
      await this.logout();
      return null;
    }
  }

  getToken(): string | null {
    this.ensureInitialized();
    return this.token;
  }

  getUser(): User | null {
    this.ensureInitialized();
    return this.user;
  }

  isAuthenticated(): boolean {
    this.ensureInitialized();
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

import { User } from '@repo/cms-types';
import { StorageAdapter, getStorage } from './storage';
import { LoginCredentials, RegisterCredentials, AuthResponse, HttpClient } from './types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private initialized: boolean = false;
  private storage: StorageAdapter;
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(httpClient: HttpClient, baseUrl: string, storage?: StorageAdapter) {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
    this.storage = storage || getStorage();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.token = await this.storage.getItem(TOKEN_KEY);
      const userString = await this.storage.getItem(USER_KEY);
      this.user = userString ? JSON.parse(userString) : null;
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing auth service:', error);
      this.initialized = true; // Mark as initialized even if it failed
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.httpClient.post<{
        user: User;
        token: string;
        exp: number;
      }>('/users/login', credentials);

      if (response.error || !response.data) {
        return {
          success: false,
          message: response.error || 'Login failed',
        };
      }

      const { user, token, exp } = response.data;
      
      // Store the token and user
      await this.storage.setItem(TOKEN_KEY, token);
      await this.storage.setItem(USER_KEY, JSON.stringify(user));
      
      this.token = token;
      this.user = user;

      return {
        success: true,
        user,
        token,
        exp,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.httpClient.post<{
        doc: User;
        message: string;
      }>('/users', credentials);

      if (response.error) {
        return {
          success: false,
          message: response.error || 'Registration failed',
        };
      }

      // Auto-login after successful registration
      return this.login(credentials);
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.storage.removeItem(TOKEN_KEY);
      await this.storage.removeItem(USER_KEY);
      this.token = null;
      this.user = null;
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async getToken(): Promise<string | null> {
    await this.ensureInitialized();
    return this.token;
  }

  async getUser(): Promise<User | null> {
    await this.ensureInitialized();
    return this.user;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async refreshToken(): Promise<boolean> {
    try {
      if (!this.token) return false;

      const response = await this.httpClient.post<{
        token: string;
        exp: number;
      }>('/users/refresh', {}, {
        headers: this.getAuthHeaders(),
      });

      if (response.error || !response.data) {
        await this.logout();
        return false;
      }

      const { token, exp } = response.data;
      await this.storage.setItem(TOKEN_KEY, token);
      this.token = token;

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await this.logout();
      return false;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await this.httpClient.get<{ user: User }>('/users/me', {
        headers: this.getAuthHeaders(),
      });

      if (response.error || !response.data) {
        await this.logout();
        return false;
      }

      this.user = response.data.user;
      await this.storage.setItem(USER_KEY, JSON.stringify(this.user));
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      await this.logout();
      return false;
    }
  }
}

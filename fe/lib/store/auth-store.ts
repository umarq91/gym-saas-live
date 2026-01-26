import { create } from 'zustand';
import { apiPost, endpoints } from '@/lib/api-client';

export type UserRole = 'SUPER_USER' | 'OWNER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  gymId?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  loadAuthFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiPost<{ user: User; token: string }>(endpoints.auth.login, {
        email,
        password,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        return true;
      } else {
        const errorMsg = response.error || 'Login failed';
        set({ error: errorMsg, isLoading: false });
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setToken: (token) => {
    set({ token });
  },

  clearError: () => {
    set({ error: null });
  },

  loadAuthFromStorage: () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
  },
}));

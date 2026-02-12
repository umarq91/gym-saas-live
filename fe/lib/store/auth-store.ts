import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiPost, apiGet, endpoints } from '@/lib/api-client';

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
  isHydrated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  validateToken: () => Promise<boolean>;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
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

      validateToken: async () => {
        const { token } = get();

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        try {
          const response = await apiGet<{ user: User }>(endpoints.auth.profile);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
            });
            return true;
          } else {
            // Token is invalid
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
            return false;
          }
        } catch (err) {
          // Token validation failed
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

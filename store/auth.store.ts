import { create } from 'zustand';
import apiClient from '../services/api/client';
import { tokenStorage } from '../utils/tokenStorage';
import { User, AuthResponse, ApiResponse } from '../types/auth.types';
import { userService } from '../services/api/user.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenIfNeeded: () => Promise<void>;
  clearAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setToken: (token: string) => {
    set({ token });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        set({ user, token, isAuthenticated: true });
        await tokenStorage.setRefreshToken(refreshToken);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrasi gagal';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        set({ user, token, isAuthenticated: true });
        await tokenStorage.setRefreshToken(refreshToken);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/logout');
      await get().clearAuth();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Tetap clear auth meskipun API call gagal
      await get().clearAuth();
    } finally {
      set({ isLoading: false });
    }
  },

  clearAuth: async () => {
    set({ user: null, token: null, isAuthenticated: false, error: null });
    await tokenStorage.removeRefreshToken();
  },

  refreshTokenIfNeeded: async () => {
    // Dipanggil dari interceptor jika token expired
    // Interceptor sudah handle ini, jadi ini bisa digunakan untuk manual refresh jika perlu
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        await get().clearAuth();
        return;
      }

      // Try to refresh token on app startup
      const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', {
        refreshToken,
      });

      if (response.data.success && response.data.data) {
        set({ token: response.data.data.token, isAuthenticated: true });

        // Fetch user profile after token is refreshed
        try {
          const user = await userService.getProfile();
          set({ user });
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          await get().clearAuth();
        }
      } else {
        await get().clearAuth();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await get().clearAuth();
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateProfile(data);
      if (response.id) {
        set({ user: response });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memperbarui profil';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
}));

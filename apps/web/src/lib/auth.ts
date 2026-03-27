'use client';

import { create } from 'zustand';
import { api } from './api-client';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  init: () => {
    try {
      const userJson = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      if (userJson && accessToken) {
        const user = JSON.parse(userJson) as AuthUser;
        api.setAccessToken(accessToken);
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      const data = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password },
      );
      api.setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (formData) => {
    set({ error: null, isLoading: true });
    try {
      const data = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/register',
        formData,
      );
      api.setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Registration failed', isLoading: false });
      throw err;
    }
  },

  demoLogin: async () => {
    set({ error: null, isLoading: true });
    try {
      const data = await api.post<{ user: AuthUser; accessToken: string; refreshToken: string }>(
        '/auth/demo',
      );
      api.setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Demo login failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout API errors
    } finally {
      api.setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentOrg');
      set({ user: null, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));

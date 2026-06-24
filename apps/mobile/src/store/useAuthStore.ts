import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import apiClient from '@/core/api/api';

export type UserRole = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  name?: string;
  avatarUrl?: string;
  freeAdsRemaining?: number;
  companyProfile?: { name: string; logoUrl?: string } | null;
  officeProfile?: { name: string; logoUrl?: string } | null;
  individualProfile?: any | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadPersistedAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  // Called immediately on login or successful registration
  setAuth: async (user, token) => {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (e) {
      console.error('Failed to save secure token:', e);
    }
  },

  // Completely clears auth context on logout or session expiration
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      set({ user: null, token: null, isLoading: false });
    } catch (e) {
      console.error('Failed to delete secure token:', e);
    }
  },

  // Called once when the app cold boots to check if a valid session exists
  loadPersistedAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        // Set the token first so that interceptors include it
        set({ token });
        try {
          const response = await apiClient.get<{ user: User }>('/users/me');
          if (response.data && response.data.user) {
            set({ user: response.data.user, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  refreshProfile: async () => {
    try {
      const response = await apiClient.get<{ user: User }>('/users/me');
      if (response.data && response.data.user) {
        set({ user: response.data.user });
      }
    } catch (e) {
      console.error('Failed to refresh user profile:', e);
    }
  },
}));

import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import apiClient, { setAuthToken, setOnUnauthorized } from '@/core/api/api';
import { socketService } from '@/core/services/socket.service';

import { useChatStore } from './useChatStore';
import { useFavoritesStore } from './useFavoritesStore';

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

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire up the 401 callback once the store is created — no circular import needed
  setOnUnauthorized(() => {
    get().logout();
  });

  return {
    user: null,
    token: null,
    isLoading: true,

    // Called immediately on login or successful registration
    setAuth: async (user, token) => {
      try {
        await SecureStore.setItemAsync('auth_token', token);
        setAuthToken(token); // keep api interceptor in sync
        socketService.connect(token);
        set({ user, token, isLoading: false });
      } catch (e) {
        console.error('Failed to save secure token:', e);
      }
    },

    // Completely clears auth context on logout or session expiration
    logout: async () => {
      try {
        await SecureStore.deleteItemAsync('auth_token');
        setAuthToken(null); // clear token in api interceptor
        socketService.disconnect();
        useFavoritesStore.getState().clear();
        useChatStore.getState().clear();
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
          // Sync token to the interceptor BEFORE making the API call
          setAuthToken(token);
          socketService.connect(token);
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
      // Don't attempt a network call if we have no token yet — avoids a
      // spurious 401 while loadPersistedAuth() is still running on cold boot.
      const { token } = useAuthStore.getState();
      if (!token) return;

      try {
        const response = await apiClient.get<{ user: User }>('/users/me');
        if (response.data && response.data.user) {
          set({ user: response.data.user });
        }
      } catch (e) {
        console.error('Failed to refresh user profile:', e);
      }
    },
  };
});

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export type UserRole = "INDIVIDUAL" | "COMPANY";

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadPersistedAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  // Called immediately on login or successful registration
  setAuth: async (user, token) => {
    try {
      await SecureStore.setItemAsync("auth_token", token);
      set({ user, token, isLoading: false });
    } catch (e) {
      console.error("Failed to save secure token:", e);
    }
  },

  // Completely clears auth context on logout or session expiration
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("auth_token");
      set({ user: null, token: null, isLoading: false });
    } catch (e) {
      console.error("Failed to delete secure token:", e);
    }
  },

  // Called once when the app cold boots to check if a valid session exists
  loadPersistedAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        // Optional: You can make an API request to /users/me here to fetch profile state,
        // for now we set the token to restore naviation state.
        set({ token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));

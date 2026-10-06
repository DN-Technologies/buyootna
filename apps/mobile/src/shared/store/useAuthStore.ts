import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import apiClient, { setAuthToken, setOnUnauthorized } from '@/shared/api/api';
import { socketService } from '@/shared/services/socket.service';

import { clearIdentityScopedStores } from './identityScopedStores';
import { hasInstallStorage } from './installStorage';
import { useChatStore } from './useChatStore';

export type IdentityType = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';

// Lives in AsyncStorage, which — unlike the iOS Keychain — is wiped when
// the app is deleted. Its absence therefore signals a fresh install, and
// any Keychain session left over from a previous install must be dropped
// (QA: session survived delete + reinstall).
const INSTALL_SENTINEL_KEY = '@buyootna/install-sentinel';

export interface IndividualData {
  name: string | null;
  whatsapp: string | null;
  avatarUrl: string | null;
}

export interface CompanyData {
  id?: string;
  name: string;
  logoUrl: string | null;
  services?: string | null;
  hqLocation?: string | null;
  serviceAreas?: string | null;
  about?: string | null;
  licenseActivity?: string | null;
  licenseNumber?: string;
  licenseExpiry?: string | null;
  licenseFileUrl?: string | null;
  isVerified?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface OfficeData {
  id?: string;
  name: string;
  logoUrl: string | null;
  services?: string | null;
  hqLocation?: string | null;
  about?: string | null;
  licenseActivity?: string | null;
  licenseNumber?: string;
  licenseExpiry?: string | null;
  licenseFileUrl?: string | null;
  isVerified?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Identity {
  id: string;
  type: IdentityType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  individualData?: IndividualData | null;
  companyData?: CompanyData | null;
  officeData?: OfficeData | null;
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  whatsapp?: string | null;
  isDisabled: boolean;
  isBlocked: boolean;
  createdAt: string;
  // Legacy fields (for backward compatibility)
  role?: IdentityType | null;
  name?: string | null;
  avatarUrl?: string | null;
  freeAdsRemaining?: number | null;
}

interface AuthState {
  user: User | null;
  activeIdentity: Identity | null;
  identities: Identity[];
  token: string | null;
  sessionId: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (
    user: User,
    activeIdentity: Identity,
    identities: Identity[],
    token: string,
    sessionId: string
  ) => Promise<void>;
  switchIdentity: (identityId: string) => Promise<void>;
  logout: () => Promise<void>;
  loadPersistedAuth: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateActiveIdentity: (identity: Identity) => void;
  addIdentity: (identity: Identity) => void;
  removeIdentity: (identityId: string) => void;
}

// interface LoginResponse {
//   access_token: string;
//   user: User;
//   activeIdentity: Identity;
//   identities: Identity[];
// }

interface SwitchIdentityResponse {
  access_token: string;
  sessionId: string;
  user: User;
  activeIdentity: Identity;
  identities: Identity[];
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire up the 401 callback once the store is created
  setOnUnauthorized(() => {
    get().logout();
  });

  return {
    user: null,
    activeIdentity: null,
    identities: [],
    token: null,
    sessionId: null,
    isLoading: true,

    // Called immediately on login or successful registration
    setAuth: async (user, activeIdentity, identities, token, sessionId) => {
      try {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('session_id', sessionId);
        setAuthToken(token);
        socketService.connect(token);
        set({
          user,
          activeIdentity,
          identities,
          token,
          sessionId,
          isLoading: false,
        });
      } catch (e) {
        console.error('Failed to save secure token:', e);
      }
    },

    // Switch to a different identity
    switchIdentity: async (identityId: string) => {
      try {
        const response = await apiClient.post<SwitchIdentityResponse>(
          '/auth/identity/switch',
          { identityId }
        );

        const { access_token, sessionId, user, activeIdentity, identities } =
          response.data;

        // Update token in secure storage
        await SecureStore.setItemAsync('auth_token', access_token);
        setAuthToken(access_token);

        // Reconnect socket with new token
        socketService.disconnect();
        socketService.connect(access_token);

        // Clear identity-specific data
        clearIdentityScopedStores();
        useChatStore.getState().clear();

        set({
          user,
          activeIdentity,
          identities,
          token: access_token,
          sessionId,
        });
      } catch (e) {
        console.error('Failed to switch identity:', e);
        throw e;
      }
    },

    // Completely clears auth context on logout or session expiration
    logout: async () => {
      const { sessionId } = get();
      if (sessionId) {
        // Best-effort — local logout must always succeed even if this fails
        // (offline, expired token, etc).
        apiClient.delete(`/devices/${sessionId}`).catch(() => undefined);
      }

      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('session_id');
        setAuthToken(null);
        socketService.disconnect();
        clearIdentityScopedStores();
        useChatStore.getState().clear();
        set({
          user: null,
          activeIdentity: null,
          identities: [],
          token: null,
          sessionId: null,
          isLoading: false,
        });
      } catch (e) {
        console.error('Failed to delete secure token:', e);
      }
    },

    // Called once when the app cold boots to check if a valid session exists
    loadPersistedAuth: async () => {
      try {
        // iOS Keychain items survive app deletion, so a reinstall would
        // otherwise resurrect the previous session. AsyncStorage is wiped
        // on uninstall: a missing sentinel means this is a fresh install,
        // and any Keychain session left behind must be dropped. Failure
        // mode is fail-secure — if sentinel handling throws, we fall into
        // the outer catch and boot logged out.
        //
        // Binaries without the AsyncStorage native module (older 1.4.0
        // builds reached by OTA) skip the check: there every call throws,
        // and the fail-secure path would log the user out on every launch.
        if (hasInstallStorage()) {
          const installSentinel = await AsyncStorage.getItem(
            INSTALL_SENTINEL_KEY,
          );
          if (!installSentinel) {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('session_id');
            await AsyncStorage.setItem(INSTALL_SENTINEL_KEY, '1');
            set({ token: null, sessionId: null, isLoading: false });
            return;
          }
          await AsyncStorage.setItem(INSTALL_SENTINEL_KEY, '1');
        }

        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          const sessionId = await SecureStore.getItemAsync('session_id');
          setAuthToken(token);
          socketService.connect(token);
          set({ token, sessionId });
          try {
            const response = await apiClient.get<{
              user: User;
              activeIdentity: Identity;
              identities: Identity[];
            }>('/users/me');

            if (response.data) {
              const { user, activeIdentity, identities } = response.data;
              set({
                user,
                activeIdentity: activeIdentity || null,
                identities: identities || [],
                isLoading: false,
              });
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
      const { token } = useAuthStore.getState();
      if (!token) return;

      try {
        const response = await apiClient.get<{
          user: User;
          activeIdentity: Identity;
          identities: Identity[];
        }>('/users/me');

        if (response.data) {
          const { user, activeIdentity, identities } = response.data;
          set({
            user,
            activeIdentity: activeIdentity || null,
            identities: identities || [],
          });
        }
      } catch (e) {
        console.warn('Could not refresh user profile:', e);
      }
    },

    // Update active identity after profile edit
    updateActiveIdentity: (identity: Identity) => {
      const { identities } = get();
      const updatedIdentities = identities.map((i) =>
        i.id === identity.id ? identity : i
      );
      set({
        activeIdentity: identity,
        identities: updatedIdentities,
      });
    },

    // Add a new identity to the list
    addIdentity: (identity: Identity) => {
      const { identities } = get();
      set({
        identities: [...identities, identity],
      });
    },

    // Remove an identity from the list
    removeIdentity: (identityId: string) => {
      const { identities, activeIdentity } = get();
      const updatedIdentities = identities.filter((i) => i.id !== identityId);

      // If removed identity was active, switch to first available
      if (activeIdentity?.id === identityId && updatedIdentities.length > 0) {
        const newActive = updatedIdentities[0];
        get().switchIdentity(newActive.id);
      }

      set({ identities: updatedIdentities });
    },
  };
});

// Helper hook for identity-related utilities
export function getIdentityDisplayName(identity: Identity | null): string {
  if (!identity) return 'مستخدم';

  switch (identity.type) {
    case 'INDIVIDUAL':
      return identity.individualData?.name || 'مستخدم';
    case 'COMPANY':
      return identity.companyData?.name || 'شركة';
    case 'OFFICE':
      return identity.officeData?.name || 'مكتب';
    default:
      return 'مستخدم';
  }
}

export function getIdentityAvatarUrl(identity: Identity | null): string | null {
  if (!identity) return null;

  switch (identity.type) {
    case 'INDIVIDUAL':
      return identity.individualData?.avatarUrl || null;
    case 'COMPANY':
      return identity.companyData?.logoUrl || null;
    case 'OFFICE':
      return identity.officeData?.logoUrl || null;
    default:
      return null;
  }
}

export function isVerifiedIdentity(identity: Identity | null): boolean {
  if (!identity) return false;

  switch (identity.type) {
    case 'COMPANY':
      return identity.companyData?.isVerified || false;
    case 'OFFICE':
      return identity.officeData?.isVerified || false;
    default:
      return false;
  }
}

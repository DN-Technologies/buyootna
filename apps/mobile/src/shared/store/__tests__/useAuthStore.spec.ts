import * as SecureStore from 'expo-secure-store';

import apiClient, { setAuthToken, setOnUnauthorized } from '@/shared/api/api';
import { socketService } from '@/shared/services/socket.service';

import * as identityScopedStoresModule from '../identityScopedStores';
import {
  getIdentityAvatarUrl,
  getIdentityDisplayName,
  Identity,
  isVerifiedIdentity,
  useAuthStore,
  User,
} from '../useAuthStore';
import { useChatStore } from '../useChatStore';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  setAuthToken: jest.fn(),
  setOnUnauthorized: jest.fn(),
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// useAuthStore's create() factory calls setOnUnauthorized exactly once, at
// module-import time (above) — capture it now, before any test's
// jest.clearAllMocks() wipes the mock's call history.
const registeredUnauthorizedCallback = (setOnUnauthorized as jest.Mock).mock
  .calls[0][0] as () => void;

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'a@example.com',
  phone: null,
  isDisabled: false,
  isBlocked: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const buildIdentity = (overrides: Partial<Identity> = {}): Identity => ({
  id: 'identity-1',
  type: 'INDIVIDUAL',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const initialState = useAuthStore.getState();

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState(
      {
        user: null,
        activeIdentity: null,
        identities: [],
        token: null,
        isLoading: true,
      },
      false,
    );
  });

  afterAll(() => {
    useAuthStore.setState(initialState, true);
  });

  describe('getIdentityDisplayName', () => {
    it('returns a generic fallback for a null identity', () => {
      expect(getIdentityDisplayName(null)).toBe('مستخدم');
    });

    it("returns the individual's name, falling back to a generic label", () => {
      expect(
        getIdentityDisplayName(
          buildIdentity({
            type: 'INDIVIDUAL',
            individualData: { name: 'Ali', whatsapp: null, avatarUrl: null },
          }),
        ),
      ).toBe('Ali');
      expect(
        getIdentityDisplayName(buildIdentity({ type: 'INDIVIDUAL' })),
      ).toBe('مستخدم');
    });

    it("returns the company's name, falling back to a generic label", () => {
      expect(
        getIdentityDisplayName(
          buildIdentity({
            type: 'COMPANY',
            companyData: { name: 'Acme', logoUrl: null },
          }),
        ),
      ).toBe('Acme');
      expect(getIdentityDisplayName(buildIdentity({ type: 'COMPANY' }))).toBe(
        'شركة',
      );
    });

    it("returns the office's name, falling back to a generic label", () => {
      expect(
        getIdentityDisplayName(
          buildIdentity({
            type: 'OFFICE',
            officeData: { name: 'Best Office', logoUrl: null },
          }),
        ),
      ).toBe('Best Office');
      expect(getIdentityDisplayName(buildIdentity({ type: 'OFFICE' }))).toBe(
        'مكتب',
      );
    });
  });

  describe('getIdentityAvatarUrl', () => {
    it('returns null for a null identity', () => {
      expect(getIdentityAvatarUrl(null)).toBeNull();
    });

    it('reads the avatar/logo url per type, falling back to null', () => {
      expect(
        getIdentityAvatarUrl(
          buildIdentity({
            type: 'INDIVIDUAL',
            individualData: {
              name: null,
              whatsapp: null,
              avatarUrl: 'avatar.png',
            },
          }),
        ),
      ).toBe('avatar.png');
      expect(
        getIdentityAvatarUrl(
          buildIdentity({
            type: 'COMPANY',
            companyData: { name: 'Acme', logoUrl: 'logo.png' },
          }),
        ),
      ).toBe('logo.png');
      expect(getIdentityAvatarUrl(buildIdentity({ type: 'OFFICE' }))).toBeNull();
    });
  });

  describe('isVerifiedIdentity', () => {
    it('returns false for a null identity and for INDIVIDUAL (no verification concept)', () => {
      expect(isVerifiedIdentity(null)).toBe(false);
      expect(isVerifiedIdentity(buildIdentity({ type: 'INDIVIDUAL' }))).toBe(
        false,
      );
    });

    it('reads isVerified for COMPANY/OFFICE, falling back to false', () => {
      expect(
        isVerifiedIdentity(
          buildIdentity({
            type: 'COMPANY',
            companyData: { name: 'Acme', logoUrl: null, isVerified: true },
          }),
        ),
      ).toBe(true);
      expect(isVerifiedIdentity(buildIdentity({ type: 'OFFICE' }))).toBe(
        false,
      );
    });
  });

  describe('setAuth', () => {
    it('persists the token, wires up the api client and socket, and updates state', async () => {
      const user = buildUser();
      const identity = buildIdentity();

      await useAuthStore.getState().setAuth(user, identity, [identity], 'tok-1');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_token',
        'tok-1',
      );
      expect(setAuthToken).toHaveBeenCalledWith('tok-1');
      expect(socketService.connect).toHaveBeenCalledWith('tok-1');

      const state = useAuthStore.getState();
      expect(state.user).toBe(user);
      expect(state.activeIdentity).toBe(identity);
      expect(state.identities).toEqual([identity]);
      expect(state.token).toBe('tok-1');
      expect(state.isLoading).toBe(false);
    });

    it('catches a SecureStore failure without throwing and without updating state', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('keychain unavailable'),
      );
      const user = buildUser();
      const identity = buildIdentity();

      await expect(
        useAuthStore.getState().setAuth(user, identity, [identity], 'tok-1'),
      ).resolves.toBeUndefined();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  describe('switchIdentity', () => {
    it('posts to /auth/identity/switch, persists the new token, reconnects the socket, clears scoped stores, and updates state', async () => {
      const clearChatSpy = jest
        .spyOn(useChatStore.getState(), 'clear')
        .mockImplementation(() => {});
      const clearScopedSpy = jest.spyOn(
        identityScopedStoresModule,
        'clearIdentityScopedStores',
      );
      const newIdentity = buildIdentity({ id: 'identity-2' });
      const newUser = buildUser({ id: 'user-2' });
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          access_token: 'tok-2',
          user: newUser,
          activeIdentity: newIdentity,
          identities: [newIdentity],
        },
      });

      await useAuthStore.getState().switchIdentity('identity-2');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/identity/switch',
        { identityId: 'identity-2' },
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_token',
        'tok-2',
      );
      expect(setAuthToken).toHaveBeenCalledWith('tok-2');
      expect(socketService.disconnect).toHaveBeenCalled();
      expect(socketService.connect).toHaveBeenCalledWith('tok-2');
      expect(clearScopedSpy).toHaveBeenCalled();
      expect(clearChatSpy).toHaveBeenCalled();

      const state = useAuthStore.getState();
      expect(state.user).toBe(newUser);
      expect(state.activeIdentity).toBe(newIdentity);
      expect(state.token).toBe('tok-2');

      clearChatSpy.mockRestore();
      clearScopedSpy.mockRestore();
    });

    it('logs and re-throws on failure', async () => {
      jest.spyOn(useChatStore.getState(), 'clear').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiClient.post.mockRejectedValueOnce(new Error('network down'));

      await expect(
        useAuthStore.getState().switchIdentity('identity-2'),
      ).rejects.toThrow('network down');

      jest.restoreAllMocks();
    });
  });

  describe('logout', () => {
    it('clears the token, disconnects the socket, clears scoped stores, and resets state', async () => {
      jest.spyOn(useChatStore.getState(), 'clear').mockImplementation(() => {});
      const clearScopedSpy = jest.spyOn(
        identityScopedStoresModule,
        'clearIdentityScopedStores',
      );
      useAuthStore.setState({
        user: buildUser(),
        activeIdentity: buildIdentity(),
        identities: [buildIdentity()],
        token: 'tok-1',
        isLoading: false,
      });

      await useAuthStore.getState().logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(setAuthToken).toHaveBeenCalledWith(null);
      expect(socketService.disconnect).toHaveBeenCalled();
      expect(clearScopedSpy).toHaveBeenCalled();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.activeIdentity).toBeNull();
      expect(state.identities).toEqual([]);
      expect(state.token).toBeNull();
      expect(state.isLoading).toBe(false);

      jest.restoreAllMocks();
    });
  });

  describe('loadPersistedAuth', () => {
    it('sets isLoading:false and makes no API call when there is no stored token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().loadPersistedAuth();

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('hydrates state from /users/me when a token is present', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('tok-1');
      const user = buildUser();
      const identity = buildIdentity();
      mockApiClient.get.mockResolvedValueOnce({
        data: { user, activeIdentity: identity, identities: [identity] },
      });

      await useAuthStore.getState().loadPersistedAuth();

      expect(setAuthToken).toHaveBeenCalledWith('tok-1');
      expect(socketService.connect).toHaveBeenCalledWith('tok-1');
      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isLoading).toBe(false);
    });

    it('swallows a /users/me failure, only setting isLoading:false', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('tok-1');
      mockApiClient.get.mockRejectedValueOnce(new Error('server down'));

      await expect(
        useAuthStore.getState().loadPersistedAuth(),
      ).resolves.toBeUndefined();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('swallows a SecureStore failure, only setting isLoading:false', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('keychain unavailable'),
      );

      await expect(
        useAuthStore.getState().loadPersistedAuth(),
      ).resolves.toBeUndefined();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('refreshProfile', () => {
    it('is a no-op when there is no token', async () => {
      await useAuthStore.getState().refreshProfile();
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('updates user/activeIdentity/identities on success, leaving isLoading untouched', async () => {
      useAuthStore.setState({ token: 'tok-1', isLoading: false });
      const user = buildUser({ id: 'refreshed-user' });
      const identity = buildIdentity();
      mockApiClient.get.mockResolvedValueOnce({
        data: { user, activeIdentity: identity, identities: [identity] },
      });

      await useAuthStore.getState().refreshProfile();

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('warns and leaves state unchanged on failure', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      useAuthStore.setState({ token: 'tok-1', user: null });
      mockApiClient.get.mockRejectedValueOnce(new Error('server down'));

      await expect(
        useAuthStore.getState().refreshProfile(),
      ).resolves.toBeUndefined();
      expect(useAuthStore.getState().user).toBeNull();

      jest.restoreAllMocks();
    });
  });

  describe('updateActiveIdentity / addIdentity', () => {
    it('updateActiveIdentity replaces the matching identity and sets it active', () => {
      const identityA = buildIdentity({ id: 'a' });
      const identityB = buildIdentity({ id: 'b' });
      useAuthStore.setState({ identities: [identityA, identityB] });

      const updatedA = { ...identityA, isActive: true };
      useAuthStore.getState().updateActiveIdentity(updatedA);

      const state = useAuthStore.getState();
      expect(state.activeIdentity).toEqual(updatedA);
      expect(state.identities.find((i) => i.id === 'a')).toEqual(updatedA);
    });

    it('addIdentity appends to the identities list', () => {
      const identityA = buildIdentity({ id: 'a' });
      useAuthStore.setState({ identities: [identityA] });

      const identityB = buildIdentity({ id: 'b' });
      useAuthStore.getState().addIdentity(identityB);

      expect(useAuthStore.getState().identities).toEqual([
        identityA,
        identityB,
      ]);
    });
  });

  describe('removeIdentity', () => {
    it('filters the identity out and switches to the first remaining one when it was active', () => {
      jest.spyOn(useChatStore.getState(), 'clear').mockImplementation(() => {});
      const active = buildIdentity({ id: 'active-id' });
      const other = buildIdentity({ id: 'other-id' });
      mockApiClient.post.mockResolvedValueOnce({
        data: {
          access_token: 'tok-2',
          user: buildUser(),
          activeIdentity: other,
          identities: [other],
        },
      });
      useAuthStore.setState({ activeIdentity: active, identities: [active, other] });

      useAuthStore.getState().removeIdentity('active-id');

      expect(useAuthStore.getState().identities).toEqual([other]);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/identity/switch',
        { identityId: 'other-id' },
      );

      jest.restoreAllMocks();
    });

    it('does not switch identity when the removed one was not active', () => {
      const active = buildIdentity({ id: 'active-id' });
      const other = buildIdentity({ id: 'other-id' });
      useAuthStore.setState({ activeIdentity: active, identities: [active, other] });

      useAuthStore.getState().removeIdentity('other-id');

      expect(useAuthStore.getState().identities).toEqual([active]);
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('does not switch identity when no identities remain', () => {
      const active = buildIdentity({ id: 'active-id' });
      useAuthStore.setState({ activeIdentity: active, identities: [active] });

      useAuthStore.getState().removeIdentity('active-id');

      expect(useAuthStore.getState().identities).toEqual([]);
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('setOnUnauthorized wiring', () => {
    it('registers a callback at module load that logs the user out when invoked', async () => {
      expect(registeredUnauthorizedCallback).toEqual(expect.any(Function));
      jest.spyOn(useChatStore.getState(), 'clear').mockImplementation(() => {});
      useAuthStore.setState({
        user: buildUser(),
        token: 'tok-1',
        isLoading: false,
      });

      registeredUnauthorizedCallback();

      // logout() is async; flush the microtask queue.
      await Promise.resolve();
      await Promise.resolve();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();

      jest.restoreAllMocks();
    });
  });
});

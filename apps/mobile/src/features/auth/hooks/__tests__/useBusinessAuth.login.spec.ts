import { act, renderHook } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { showAlert } from '@/shared/utils/alert';

import { useTermsAgreement } from '../../terms';
import { useBusinessAuth } from '../useBusinessAuth';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
jest.mock('@/shared/navigation/getIdentityHomeRoute', () => ({
  resetToIdentityHome: jest.fn(),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/utils/reactivationNotice', () => ({
  notifyIfReactivated: jest.fn(),
}));
const mockSetAuth = jest.fn();
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { setAuth: jest.Mock }) => unknown) =>
    selector({ setAuth: mockSetAuth }),
}));

const post = apiClient.post as jest.Mock;

describe('useBusinessAuth › login opens the persona picked on the screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTermsAgreement.setState({ accepted: true });
  });

  it('signing in needs no terms box (it is on sign-up only)', async () => {
    useTermsAgreement.setState({ accepted: false });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'office' });
    post.mockResolvedValueOnce({
      data: {
        user: { id: 'u1' },
        activeIdentity: { id: 'i1', type: 'OFFICE' },
        identities: [],
        access_token: 'jwt',
        sessionId: 's1',
      },
    });
    const { result } = await renderHook(() => useBusinessAuth());

    await act(() =>
      result.current.onLogin({
        identifier: 'ali@example.com',
        password: 'secret12',
      }),
    );

    expect(post).toHaveBeenCalledWith('/auth/login', {
      identifier: 'ali@example.com',
      password: 'secret12',
      identityType: 'OFFICE',
    });
    expect(showAlert).not.toHaveBeenCalled();
  });

  it.each([
    ['office', 'OFFICE'],
    ['company', 'COMPANY'],
  ] as const)(
    'مكتب / شركة: %s logs in to the %s persona and opens its dashboard',
    async (screenType, identityType) => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: screenType });
      post.mockResolvedValueOnce({
        data: {
          user: { id: 'u1' },
          activeIdentity: { id: 'i1', type: identityType },
          identities: [],
          access_token: 'jwt',
          sessionId: 's1',
        },
      });
      const { result } = await renderHook(() => useBusinessAuth());

      await act(() =>
        result.current.onLogin({
          identifier: 'ali@example.com',
          password: 'secret12',
          }),
      );

      expect(post).toHaveBeenCalledWith('/auth/login', {
        identifier: 'ali@example.com',
        password: 'secret12',
        identityType,
      });
      expect(resetToIdentityHome).toHaveBeenCalledWith(identityType);
    },
  );
});

import apiClient from '@/shared/api/api';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { showAlert } from '@/shared/utils/alert';

import { loginAs } from '../loginAs';

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

const post = apiClient.post as jest.Mock;
const credentials = { identifier: 'ali@example.com', password: 'secret12' };

const loginResponse = (type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE') => ({
  data: {
    user: { id: 'u1' },
    activeIdentity: { id: `id-${type}`, type },
    identities: [],
    access_token: 'jwt',
    sessionId: 's1',
  },
});

describe('loginAs (the login screen\'s فرد / مكتب / شركة)', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['INDIVIDUAL', 'COMPANY', 'OFFICE'] as const)(
    'asks the server for the %s persona and opens its home',
    async (type) => {
      const setAuth = jest.fn();
      post.mockResolvedValueOnce(loginResponse(type));

      await loginAs(credentials, type, setAuth);

      expect(post).toHaveBeenCalledWith('/auth/login', {
        ...credentials,
        identityType: type,
      });
      expect(setAuth).toHaveBeenCalledWith(
        { id: 'u1' },
        { id: `id-${type}`, type },
        [],
        'jwt',
        's1',
      );
      expect(resetToIdentityHome).toHaveBeenCalledWith(type);
    },
  );

  it("offers the account's other personas when it has none of the type picked", async () => {
    const setAuth = jest.fn();
    post.mockRejectedValueOnce({
      response: {
        data: {
          code: 'IDENTITY_TYPE_NOT_FOUND',
          message: 'لا يوجد حساب مكتب مرتبط بهذا الحساب.',
          availableTypes: ['INDIVIDUAL', 'COMPANY'],
        },
      },
    });

    await loginAs(credentials, 'OFFICE', setAuth);

    expect(setAuth).not.toHaveBeenCalled();
    expect(resetToIdentityHome).not.toHaveBeenCalled();
    const [title, message, buttons] = (showAlert as jest.Mock).mock.calls[0];
    expect(title).toBe('لا يوجد هذا الحساب');
    expect(message).toBe('لا يوجد حساب مكتب مرتبط بهذا الحساب.');
    expect(buttons.map((b: { text: string }) => b.text)).toEqual([
      'الدخول كـفرد',
      'الدخول كـشركة',
      'إلغاء',
    ]);

    // Picking one signs in to it
    post.mockResolvedValueOnce(loginResponse('COMPANY'));
    buttons[1].onPress();
    await new Promise((resolve) => setImmediate(resolve));

    expect(post).toHaveBeenLastCalledWith('/auth/login', {
      ...credentials,
      identityType: 'COMPANY',
    });
    expect(resetToIdentityHome).toHaveBeenCalledWith('COMPANY');
  });

  it('shows other errors as a failed login', async () => {
    post.mockRejectedValueOnce({
      response: { data: { message: 'بيانات الدخول غير صحيحة' } },
    });

    await loginAs(credentials, 'INDIVIDUAL', jest.fn());

    expect(showAlert).toHaveBeenCalledWith(
      'فشل تسجيل الدخول',
      expect.any(String),
    );
    expect(resetToIdentityHome).not.toHaveBeenCalled();
  });
});

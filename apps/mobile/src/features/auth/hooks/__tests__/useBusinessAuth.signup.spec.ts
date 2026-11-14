// QA [Critical]: a company was created with a fake email and no code. The
// sign-up now sends the form (nothing is created), then the emailed code.
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
const mockSetAuth = jest.fn();
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { setAuth: jest.Mock }) => unknown) =>
    selector({ setAuth: mockSetAuth }),
}));

const post = apiClient.post as jest.Mock;
const FORM = {
  type: 'company',
  name: 'شركة البناء',
  identifier: 'co@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  specialty: 'مكتب هندسي',
} as never;

// The fields of the FormData sent (React Native's keeps _parts; the test
// environment's has entries())
const sentFields = (call: number) => {
  const form = post.mock.calls[call][1] as FormData & {
    _parts?: [string, unknown][];
  };
  return Object.fromEntries(
    form._parts ?? (form as unknown as { entries(): Iterable<[string, unknown]> }).entries(),
  );
};

describe('useBusinessAuth › company sign-up ends with the emailed code', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTermsAgreement.setState({ accepted: true });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'company', mode: 'signup' });
  });

  it('«إنشاء حساب» sends the form with the code step and moves on to the code', async () => {
    post.mockResolvedValueOnce({ data: { otpRequired: true, identifier: 'co@example.com' } });
    const { result } = await renderHook(() => useBusinessAuth());

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.onSignupFinal(FORM);
    });

    expect(outcome).toBe('otp');
    expect(post.mock.calls[0][0]).toBe('/users/register/company');
    expect(sentFields(0)).toMatchObject({
      email: 'co@example.com',
      specialty: 'مكتب هندسي',
      verification: 'email',
    });
    expect(result.current.signupIdentifier).toBe('co@example.com');
  });

  it('the code completes the sign-up on …/verify', async () => {
    post.mockResolvedValueOnce({ data: { otpRequired: true } }).mockResolvedValueOnce({ data: {} });
    const { result } = await renderHook(() => useBusinessAuth());
    await act(async () => {
      await result.current.onSignupFinal(FORM);
    });

    let verified: unknown;
    await act(async () => {
      verified = await result.current.onVerifySignupOtp('123456');
    });

    expect(verified).toBe(true);
    expect(post).toHaveBeenCalledWith('/users/register/company/verify', {
      email: 'co@example.com',
      otp: '123456',
    });
  });

  it('a wrong code says so and stays on the code', async () => {
    post
      .mockResolvedValueOnce({ data: { otpRequired: true } })
      .mockRejectedValueOnce({ response: { data: { message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' } } });
    const { result } = await renderHook(() => useBusinessAuth());
    await act(async () => {
      await result.current.onSignupFinal(FORM);
    });

    let verified: unknown;
    await act(async () => {
      verified = await result.current.onVerifySignupOtp('000000');
    });

    expect(verified).toBe(false);
    expect(showAlert).toHaveBeenCalledWith('خطأ', 'رمز التحقق غير صحيح أو منتهي الصلاحية');
  });

  it('«إعادة الإرسال» sends the same form again', async () => {
    post.mockResolvedValue({ data: { otpRequired: true } });
    const { result } = await renderHook(() => useBusinessAuth());
    await act(async () => {
      await result.current.onSignupFinal(FORM);
    });

    let resent: unknown;
    await act(async () => {
      resent = await result.current.onResendSignupOtp();
    });

    expect(resent).toEqual({ success: true });
    expect(post.mock.calls[1][0]).toBe('/users/register/company');
    expect(sentFields(1)).toMatchObject({ email: 'co@example.com', verification: 'email' });
  });

  // QA: «العودة الى الرئيسية» opened the guest home, signed out
  describe('signed in once the code is accepted', () => {
    const SESSION = {
      user: { id: 'u1' },
      activeIdentity: { id: 'c1', type: 'COMPANY' },
      identities: [{ id: 'c1', type: 'COMPANY' }],
      access_token: 'tok',
      sessionId: 's1',
    };

    async function verified() {
      const { result } = await renderHook(() => useBusinessAuth());
      await act(async () => {
        await result.current.onSignupFinal(FORM);
      });
      await act(async () => {
        await result.current.onVerifySignupOtp('123456');
      });
      return result;
    }

    it('signs in to the new company and «العودة الى الرئيسية» opens its home', async () => {
      post
        .mockResolvedValueOnce({ data: { otpRequired: true } })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({ data: SESSION });
      const result = await verified();

      expect(post).toHaveBeenLastCalledWith('/auth/login', {
        identifier: 'co@example.com',
        password: 'password123',
        identityType: 'COMPANY',
      });
      expect(mockSetAuth).toHaveBeenCalledWith(
        SESSION.user,
        SESSION.activeIdentity,
        SESSION.identities,
        'tok',
        's1',
      );
      // Not before the success sheet's button
      expect(resetToIdentityHome).not.toHaveBeenCalled();

      await act(async () => result.current.onSignupDone());
      expect(resetToIdentityHome).toHaveBeenCalledWith('COMPANY');
      expect(showAlert).not.toHaveBeenCalled();
    });

    it('an office signs in as the office', async () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'office', mode: 'signup' });
      post
        .mockResolvedValueOnce({ data: { otpRequired: true } })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({
          data: { ...SESSION, activeIdentity: { id: 'o1', type: 'OFFICE' } },
        });
      const result = await verified();

      expect(post).toHaveBeenLastCalledWith(
        '/auth/login',
        expect.objectContaining({ identityType: 'OFFICE' }),
      );
      await act(async () => result.current.onSignupDone());
      expect(resetToIdentityHome).toHaveBeenCalledWith('OFFICE');
    });

    it('if signing in fails, the sign-up still succeeds and asks to log in', async () => {
      post
        .mockResolvedValueOnce({ data: { otpRequired: true } })
        .mockResolvedValueOnce({ data: {} })
        .mockRejectedValueOnce(new Error('network'));
      const result = await verified();

      expect(mockSetAuth).not.toHaveBeenCalled();
      await act(async () => result.current.onSignupDone());
      expect(resetToIdentityHome).toHaveBeenCalledWith(null);
      expect(showAlert).toHaveBeenCalledWith('تم إنشاء الحساب', expect.any(String));
    });
  });

  // QA: one «البريد الإلكتروني أو رقم الهاتف»; a phone gets the code by SMS
  describe('signing up with a phone', () => {
    const BY_PHONE = { ...(FORM as object), identifier: '55123456' } as never;

    it('sends the phone with «verification: phone», and no email', async () => {
      post.mockResolvedValueOnce({ data: { otpRequired: true } });
      const { result } = await renderHook(() => useBusinessAuth());
      await act(async () => {
        await result.current.onSignupFinal(BY_PHONE);
      });

      const fields = sentFields(0);
      expect(fields).toMatchObject({ phone: '55123456', verification: 'phone' });
      expect(fields).not.toHaveProperty('email');
      expect(result.current.signupIdentifier).toBe('55123456');
    });

    it('verifies with the phone and signs in with it', async () => {
      post
        .mockResolvedValueOnce({ data: { otpRequired: true } })
        .mockResolvedValueOnce({ data: {} })
        .mockResolvedValueOnce({
          data: {
            user: { id: 'u1' },
            activeIdentity: { id: 'c1', type: 'COMPANY' },
            identities: [],
            access_token: 'tok',
            sessionId: 's1',
          },
        });
      const { result } = await renderHook(() => useBusinessAuth());
      await act(async () => {
        await result.current.onSignupFinal(BY_PHONE);
      });
      await act(async () => {
        await result.current.onVerifySignupOtp('123456');
      });

      expect(post).toHaveBeenCalledWith('/users/register/company/verify', {
        phone: '55123456',
        otp: '123456',
      });
      expect(post).toHaveBeenLastCalledWith('/auth/login', {
        identifier: '55123456',
        password: 'password123',
        identityType: 'COMPANY',
      });
    });
  });
});

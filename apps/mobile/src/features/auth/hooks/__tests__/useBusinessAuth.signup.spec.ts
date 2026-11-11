// QA [Critical]: a company was created with a fake email and no code. The
// sign-up now sends the form (nothing is created), then the emailed code.
import { act, renderHook } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import apiClient from '@/shared/api/api';
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
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { setAuth: jest.Mock }) => unknown) =>
    selector({ setAuth: jest.fn() }),
}));

const post = apiClient.post as jest.Mock;
const FORM = {
  type: 'company',
  name: 'شركة البناء',
  email: 'co@example.com',
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
    expect(result.current.signupEmail).toBe('co@example.com');
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
    expect(post).toHaveBeenLastCalledWith('/users/register/company/verify', {
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
});

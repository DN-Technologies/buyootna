import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import apiClient from '@/shared/api/api';
import { useAlertStore } from '@/shared/store/useAlertStore';

import ForgotPasswordScreen from '../forgot-password';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(useAlertStore.getState(), 'showAlert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('step 1 success posts to recovery/request-otp and advances to step 2', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: {} });
    const { getByPlaceholderText, getByText } = await render(
      <ForgotPasswordScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText('alisalem@gmail.com'),
      'ali@example.com',
    );
    await fireEvent.press(getByText('إرسال رمز التحقق'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/recovery/request-otp',
        { identifier: 'ali@example.com' },
      );
    });
    await waitFor(() => {
      expect(getByText(/أرسلنا رمز التحقق المكون من 6 أرقام إلى ali@example.com/)).toBeTruthy();
    });
  });

  it('step 1 failure shows an alert and stays on step 1', async () => {
    mockApiClient.post.mockRejectedValueOnce({
      response: { data: { message: 'تعذر الإرسال' } },
    });
    const { getByPlaceholderText, getByText, queryByText } = await render(
      <ForgotPasswordScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText('alisalem@gmail.com'),
      'ali@example.com',
    );
    await fireEvent.press(getByText('إرسال رمز التحقق'));

    await waitFor(() => {
      expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith('خطأ', 'تعذر الإرسال');
    });
    expect(queryByText('إنشاء كلمة مرور جديدة')).toBeNull();
  });

  describe('from step 2', () => {
    const advanceToStep2 = async (getByPlaceholderText: any, getByText: any) => {
      mockApiClient.post.mockResolvedValueOnce({ data: {} });
      await fireEvent.changeText(
        getByPlaceholderText('alisalem@gmail.com'),
        'ali@example.com',
      );
      await fireEvent.press(getByText('إرسال رمز التحقق'));
      await waitFor(() => getByText('التحقق من الرمز'));
      mockApiClient.post.mockClear();
    };

    it('step 2 success posts to recovery/verify-otp, saves the reset token, and advances to step 3', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { resetToken: 'reset-tok-1' },
      });
      const { getByPlaceholderText, getByText, getByDisplayValue } =
        await render(<ForgotPasswordScreen />);
      await advanceToStep2(getByPlaceholderText, getByText);

      const hiddenOtpInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenOtpInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/auth/recovery/verify-otp',
          { identifier: 'ali@example.com', otp: '123456' },
        );
      });
      await waitFor(() => {
        expect(getByText('إنشاء كلمة مرور جديدة')).toBeTruthy();
      });
    });

    it('step 2 failure shows an alert and stays on step 2', async () => {
      const { getByPlaceholderText, getByText, getByDisplayValue } =
        await render(<ForgotPasswordScreen />);
      await advanceToStep2(getByPlaceholderText, getByText);
      mockApiClient.post.mockRejectedValueOnce({
        response: { data: { message: 'رمز خاطئ' } },
      });

      const hiddenOtpInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenOtpInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith('خطأ', 'رمز خاطئ');
      });
    });

    describe('from step 3', () => {
      const advanceToStep3 = async (
        getByPlaceholderText: any,
        getByText: any,
        getByDisplayValue: any,
      ) => {
        await advanceToStep2(getByPlaceholderText, getByText);
        mockApiClient.post.mockResolvedValueOnce({
          data: { resetToken: 'reset-tok-1' },
        });
        const hiddenOtpInput = getByDisplayValue('');
        await fireEvent.changeText(hiddenOtpInput, '123456');
        await fireEvent.press(getByText('التحقق من الرمز'));
        await waitFor(() => getByText('إنشاء كلمة مرور جديدة'));
        mockApiClient.post.mockClear();
      };

      it('step 3 success posts resetToken + newPassword, then shows the success sheet', async () => {
        const {
          getByPlaceholderText,
          getByText,
          getByDisplayValue,
          getAllByPlaceholderText,
        } = await render(<ForgotPasswordScreen />);
        await advanceToStep3(getByPlaceholderText, getByText, getByDisplayValue);
        // Queue this AFTER advanceToStep3 (not before) — mockResolvedValueOnce
        // is a plain FIFO queue regardless of which endpoint each call
        // "belongs to", and advanceToStep3 queues + consumes its own values
        // for the request-otp/verify-otp calls it makes internally.
        mockApiClient.post.mockResolvedValueOnce({ data: {} });

        const passwordInputs = getAllByPlaceholderText('**************');
        await fireEvent.changeText(passwordInputs[0], 'NewPassword123');
        await fireEvent.changeText(passwordInputs[1], 'NewPassword123');
        await fireEvent.press(getByText('تحديث كلمة المرور'));

        await waitFor(() => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/auth/recovery/reset-password',
            { resetToken: 'reset-tok-1', newPassword: 'NewPassword123' },
          );
        });
        await waitFor(() => {
          expect(getByText('تم تحديث كلمة المرور بنجاح')).toBeTruthy();
        });

        await fireEvent.press(getByText('تسجيل الدخول'));
        expect(router.replace).toHaveBeenCalledWith('/(auth)/individual-auth');
      });

      it('step 3 failure shows an alert and does not navigate', async () => {
        const {
          getByPlaceholderText,
          getByText,
          getByDisplayValue,
          getAllByPlaceholderText,
        } = await render(<ForgotPasswordScreen />);
        await advanceToStep3(getByPlaceholderText, getByText, getByDisplayValue);
        mockApiClient.post.mockRejectedValueOnce({
          response: { data: { message: 'تعذر تحديث كلمة المرور' } },
        });

        const passwordInputs = getAllByPlaceholderText('**************');
        await fireEvent.changeText(passwordInputs[0], 'NewPassword123');
        await fireEvent.changeText(passwordInputs[1], 'NewPassword123');
        await fireEvent.press(getByText('تحديث كلمة المرور'));

        await waitFor(() => {
          expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
            'خطأ',
            'تعذر تحديث كلمة المرور',
          );
        });
        expect(router.replace).not.toHaveBeenCalled();
      });
    });
  });

  // NOTE: ForgotPasswordHeader's back button is icon-only (no text,
  // testID, or accessibilityRole), and this RNTL version exposes no
  // type/props-based query (no UNSAFE_getByType, no by-type query module,
  // and render()'s `root` is a lightweight instance without react-test-
  // renderer's findByType/findAllByType). It can't be selected through any
  // currently-supported testing-library query without adding a testID to
  // the production component, which is out of scope for a test-only
  // change — so handleBack's step-1-vs-step-2+ branching is not covered.

  describe('OTP rate limits drive the countdown, never a toast', () => {
    const cooldownError = (retryAfter: number) => ({
      response: {
        status: 429,
        data: {
          statusCode: 429,
          message: `يرجى الانتظار ${retryAfter} ثانية قبل طلب رمز تحقق جديد`,
          code: 'OTP_COOLDOWN',
          retryAfter,
        },
      },
    });

    const submitStep1 = async (getByPlaceholderText: any, getByText: any) => {
      await fireEvent.changeText(
        getByPlaceholderText('alisalem@gmail.com'),
        'ali@example.com',
      );
      await fireEvent.press(getByText('إرسال رمز التحقق'));
    };

    afterEach(() => {
      jest.useRealTimers();
    });

    it('a rate-limited resend updates the countdown instead of showing a toast', async () => {
      jest.useFakeTimers();
      const { getByPlaceholderText, getByText, queryByText } = await render(
        <ForgotPasswordScreen />,
      );
      mockApiClient.post.mockResolvedValueOnce({ data: {} });
      await submitStep1(getByPlaceholderText, getByText);
      await waitFor(() => getByText('التحقق من الرمز'));

      // Initial 45s countdown runs out -> resend becomes available
      await act(async () => {
        jest.advanceTimersByTime(46_000);
      });
      mockApiClient.post.mockRejectedValueOnce(cooldownError(120));
      await fireEvent.press(getByText('إعادة إرسال الرمز'));

      await waitFor(() => {
        expect(getByText(/إعادة إرسال الرمز خلال\s+0[12]:[0-9]{2}/)).toBeTruthy();
      });
      expect(useAlertStore.getState().showAlert).not.toHaveBeenCalled();
      // Button stays hidden until the server's wait has passed
      expect(queryByText('إعادة إرسال الرمز')).toBeNull();
    });

    it('a rate-limited first send still opens the code step with the countdown', async () => {
      const { getByPlaceholderText, getByText } = await render(
        <ForgotPasswordScreen />,
      );
      mockApiClient.post.mockRejectedValueOnce(cooldownError(90));

      await submitStep1(getByPlaceholderText, getByText);

      await waitFor(() => getByText('التحقق من الرمز'));
      expect(getByText(/إعادة إرسال الرمز خلال\s+01:(2|3)[0-9]/)).toBeTruthy();
      expect(useAlertStore.getState().showAlert).not.toHaveBeenCalled();
    });

    it('the daily limit is shown inline on the code step, not as a toast', async () => {
      const { getByPlaceholderText, getByText } = await render(
        <ForgotPasswordScreen />,
      );
      mockApiClient.post.mockRejectedValueOnce({
        response: {
          status: 429,
          data: {
            message: 'تم تجاوز الحد الأقصى لطلبات رمز التحقق',
            code: 'OTP_DAILY_LIMIT',
            retryAfter: 3600,
          },
        },
      });

      await submitStep1(getByPlaceholderText, getByText);

      await waitFor(() => getByText('تم تجاوز الحد الأقصى لطلبات رمز التحقق'));
      expect(useAlertStore.getState().showAlert).not.toHaveBeenCalled();
    });
  });
});

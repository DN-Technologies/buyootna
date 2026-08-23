import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import ChangePasswordScreen from '../change-password';

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    requestChangePasswordOtp: jest.fn(),
    changePassword: jest.fn(),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockSettingsService = settingsService as jest.Mocked<
  typeof settingsService
>;

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: { phone: '+96555123456' } });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  const fillAndSubmitForm = async (
    getByPlaceholderText: any,
    getByText: any,
    overrides: { oldPassword?: string; newPassword?: string; confirmPassword?: string } = {},
  ) => {
    await fireEvent.changeText(
      getByPlaceholderText('أدخل كلمة المرور الحالية'),
      overrides.oldPassword ?? 'old-password',
    );
    await fireEvent.changeText(
      getByPlaceholderText('أدخل كلمة المرور الجديدة'),
      overrides.newPassword ?? 'new-password',
    );
    await fireEvent.changeText(
      getByPlaceholderText('أعد إدخال كلمة المرور الجديدة'),
      overrides.confirmPassword ?? 'new-password',
    );
    await fireEvent.press(getByText('تحديث كلمة المرور'));
  };

  it('renders the masked phone from the current user', async () => {
    const { getByText } = await render(<ChangePasswordScreen />);

    // maskedPhone keeps everything but the last 4 digits, replacing those
    // with a fixed '••••' suffix (e.g. '+96555123456' -> '+9655512••••').
    expect(getByText(/\+9655512••••/)).toBeTruthy();
  });

  it('requests an OTP and opens the verification sheet on a valid submit', async () => {
    mockSettingsService.requestChangePasswordOtp.mockResolvedValue({
      message: 'ok',
    });
    const { getByPlaceholderText, getByText } = await render(
      <ChangePasswordScreen />,
    );

    await fillAndSubmitForm(getByPlaceholderText, getByText);

    await waitFor(() => {
      expect(mockSettingsService.requestChangePasswordOtp).toHaveBeenCalled();
    });
    expect(getByText('تحقق من الرقم')).toBeTruthy();
  });

  it('blocks submit when the new password is shorter than 6 characters', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangePasswordScreen />,
    );

    await fillAndSubmitForm(getByPlaceholderText, getByText, {
      newPassword: 'abc',
      confirmPassword: 'abc',
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockSettingsService.requestChangePasswordOtp).not.toHaveBeenCalled();
  });

  it('blocks submit when newPassword and confirmPassword do not match', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangePasswordScreen />,
    );

    await fillAndSubmitForm(getByPlaceholderText, getByText, {
      newPassword: 'new-password',
      confirmPassword: 'different-password',
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockSettingsService.requestChangePasswordOtp).not.toHaveBeenCalled();
  });

  it('shows an alert with the backend message when requesting the OTP fails', async () => {
    mockSettingsService.requestChangePasswordOtp.mockRejectedValue({
      response: { data: { message: 'تعذر الإرسال' } },
    });
    const { getByPlaceholderText, getByText } = await render(
      <ChangePasswordScreen />,
    );

    await fillAndSubmitForm(getByPlaceholderText, getByText);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('خطأ', 'تعذر الإرسال');
    });
  });

  describe('OTP verification', () => {
    const openOtpSheet = async (getByPlaceholderText: any, getByText: any) => {
      mockSettingsService.requestChangePasswordOtp.mockResolvedValue({
        message: 'ok',
      });
      await fillAndSubmitForm(getByPlaceholderText, getByText);
      await waitFor(() => getByText('تحقق من الرقم'));
    };

    it('keeps the verify button disabled (no changePassword call) while fewer than 6 digits are entered', async () => {
      // The TouchableOpacity's disabled={otp.length < 6 || isSubmitting} prop
      // already blocks the press at the UI layer, so the otp.length < 6
      // guard inside handleVerifyOtp is unreachable via a real press — this
      // documents that the disabled state itself prevents the API call.
      const { getByPlaceholderText, getByText } = await render(
        <ChangePasswordScreen />,
      );
      await openOtpSheet(getByPlaceholderText, getByText);

      await fireEvent.press(getByText('التحقق من الرمز'));

      expect(mockSettingsService.changePassword).not.toHaveBeenCalled();
    });

    it('calls changePassword with the right args on a 6-digit otp, then navigates back after the success alert', async () => {
      mockSettingsService.changePassword.mockResolvedValue({ message: 'ok' });
      const { getByPlaceholderText, getByText, getByDisplayValue } =
        await render(<ChangePasswordScreen />);
      await openOtpSheet(getByPlaceholderText, getByText);

      const hiddenOtpInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenOtpInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(mockSettingsService.changePassword).toHaveBeenCalledWith(
          'old-password',
          'new-password',
          '123456',
          false,
        );
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        (call) => call[0] === 'نجاح',
      );
      expect(alertCall).toBeDefined();
      const okButton = alertCall![2].find((b: any) => b.text === 'موافق');
      await act(async () => okButton.onPress());
      expect(router.back).toHaveBeenCalled();
    });

    it('sets an inline otpError (not a global Alert) when changePassword rejects', async () => {
      mockSettingsService.changePassword.mockRejectedValue({
        response: { data: { message: 'رمز خاطئ' } },
      });
      const { getByPlaceholderText, getByText, getByDisplayValue } =
        await render(<ChangePasswordScreen />);
      await openOtpSheet(getByPlaceholderText, getByText);

      const alertCallsBefore = (Alert.alert as jest.Mock).mock.calls.length;
      const hiddenOtpInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenOtpInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(getByText('رمز خاطئ')).toBeTruthy();
      });
      expect((Alert.alert as jest.Mock).mock.calls.length).toBe(
        alertCallsBefore,
      );
    });

    it('resend calls requestChangePasswordOtp again after the timer elapses', async () => {
      jest.useFakeTimers();
      mockSettingsService.requestChangePasswordOtp.mockResolvedValue({
        message: 'ok',
      });
      const { getByPlaceholderText, getByText } = await render(
        <ChangePasswordScreen />,
      );
      await openOtpSheet(getByPlaceholderText, getByText);

      await act(async () => {
        jest.advanceTimersByTime(45000);
      });

      await fireEvent.press(getByText('إعادة إرسال الرمز'));

      expect(mockSettingsService.requestChangePasswordOtp).toHaveBeenCalledTimes(
        2,
      );
      jest.useRealTimers();
    });
  });
});

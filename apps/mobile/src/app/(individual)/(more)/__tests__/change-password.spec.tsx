import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { settingsService } from '@/shared/api/settings.service';
import { useAlertStore } from '@/shared/store/useAlertStore';
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

// No NavigationContainer in tests: capture the focus effect so a test can
// simulate the screen gaining/losing focus.
let mockFocusEffect: (() => void | (() => void)) | undefined;
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: (effect: () => void | (() => void)) => {
    mockFocusEffect = effect;
  },
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockSettingsService = settingsService as jest.Mocked<
  typeof settingsService
>;

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: { phone: '+96555123456' } });
    jest.spyOn(useAlertStore.getState(), 'showAlert').mockImplementation(() => {});
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
      // The current password goes along, so the server checks it before
      // spending an SMS
      expect(mockSettingsService.requestChangePasswordOtp).toHaveBeenCalledWith(
        'old-password',
      );
    });
    expect(getByText('تحقق من الرقم')).toBeTruthy();
  });

  it('blocks submit when the new password equals the current one', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <ChangePasswordScreen />,
    );

    await fillAndSubmitForm(getByPlaceholderText, getByText, {
      oldPassword: 'same-password',
      newPassword: 'same-password',
      confirmPassword: 'same-password',
    });

    await waitFor(() =>
      expect(getByText('كلمة المرور الجديدة يجب أن تختلف عن الحالية')).toBeTruthy(),
    );
    expect(mockSettingsService.requestChangePasswordOtp).not.toHaveBeenCalled();
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
      expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith('خطأ', 'تعذر الإرسال');
    });
  });

  describe('accounts with no phone on file', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({ user: { phone: null } });
    });

    it('changes the password directly, without requesting an OTP or opening the verification sheet', async () => {
      mockSettingsService.changePassword.mockResolvedValue({ message: 'ok' });
      const { getByPlaceholderText, getByText } = await render(
        <ChangePasswordScreen />,
      );

      await fillAndSubmitForm(getByPlaceholderText, getByText);

      await waitFor(() => {
        expect(mockSettingsService.changePassword).toHaveBeenCalledWith(
          'old-password',
          'new-password',
          undefined,
          true,
        );
      });
      expect(mockSettingsService.requestChangePasswordOtp).not.toHaveBeenCalled();

      const alertCall = (
        useAlertStore.getState().showAlert as jest.Mock
      ).mock.calls.find((call) => call[0] === 'نجاح');
      expect(alertCall).toBeDefined();
      const okButton = alertCall![2].find((b: any) => b.text === 'موافق');
      await act(async () => okButton.onPress());
      expect(router.back).toHaveBeenCalled();
    });

    it('shows an alert with the backend message when changePassword fails', async () => {
      mockSettingsService.changePassword.mockRejectedValue({
        response: { data: { message: 'كلمة المرور القديمة غير صحيحة' } },
      });
      const { getByPlaceholderText, getByText } = await render(
        <ChangePasswordScreen />,
      );

      await fillAndSubmitForm(getByPlaceholderText, getByText);

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
          'خطأ',
          'كلمة المرور القديمة غير صحيحة',
        );
      });
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
          true,
        );
      });

      const alertCall = (
        useAlertStore.getState().showAlert as jest.Mock
      ).mock.calls.find((call) => call[0] === 'نجاح');
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

      const alertCallsBefore = (
        useAlertStore.getState().showAlert as jest.Mock
      ).mock.calls.length;
      const hiddenOtpInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenOtpInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(getByText('رمز خاطئ')).toBeTruthy();
      });
      expect(
        (useAlertStore.getState().showAlert as jest.Mock).mock.calls.length,
      ).toBe(alertCallsBefore);
    });

    // Regression coverage for the reported bug: a dropped connection (no
    // `response` on the thrown error) must not be reported as "invalid
    // verification code" -- the user typed nothing wrong, their network
    // just failed.
    it('sets a network-error otpError, not "invalid code", when changePassword fails with no response', async () => {
      mockSettingsService.changePassword.mockRejectedValue({
        message: 'Network Error',
      });
      const { getByPlaceholderText, getByText, getByDisplayValue } =
        await render(<ChangePasswordScreen />);
      await openOtpSheet(getByPlaceholderText, getByText);

      const hiddenOtpInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenOtpInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(
          getByText(
            'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
          ),
        ).toBeTruthy();
      });
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

  describe('clearing sensitive data', () => {
    const PLACEHOLDERS = [
      'أدخل كلمة المرور الحالية',
      'أدخل كلمة المرور الجديدة',
      'أعد إدخال كلمة المرور الجديدة',
    ];
    const fieldValues = (getByPlaceholderText: any) =>
      PLACEHOLDERS.map((p) => getByPlaceholderText(p).props.value);

    // Simulates navigating away: run the focus effect, then its cleanup
    const blurScreen = async () => {
      const cleanupFn = mockFocusEffect?.();
      await act(async () => {
        if (typeof cleanupFn === 'function') cleanupFn();
      });
    };

    it('empties the fields as soon as a direct change succeeds', async () => {
      mockUseAuthStore.mockReturnValue({ user: { phone: null } });
      mockSettingsService.changePassword.mockResolvedValue({ message: 'ok' });
      const { getByPlaceholderText, getByText } = await render(
        <ChangePasswordScreen />,
      );

      await fillAndSubmitForm(getByPlaceholderText, getByText);

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
          'نجاح',
          'تم تغيير كلمة المرور بنجاح',
          expect.any(Array),
        );
      });
      // Cleared before the user even confirms the success alert
      expect(fieldValues(getByPlaceholderText)).toEqual(['', '', '']);
    });

    it('empties the fields and the code after a verified (OTP) change', async () => {
      mockSettingsService.requestChangePasswordOtp.mockResolvedValue({
        message: 'ok',
      });
      mockSettingsService.changePassword.mockResolvedValue({ message: 'ok' });
      const { getByPlaceholderText, getByText, getByDisplayValue, queryByDisplayValue } =
        await render(<ChangePasswordScreen />);
      await fillAndSubmitForm(getByPlaceholderText, getByText);
      await waitFor(() => getByText('تحقق من الرقم'));

      await fireEvent.changeText(getByDisplayValue(''), '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      await waitFor(() => {
        expect(mockSettingsService.changePassword).toHaveBeenCalled();
      });
      await waitFor(() => {
        expect(fieldValues(getByPlaceholderText)).toEqual(['', '', '']);
      });
      expect(queryByDisplayValue('123456')).toBeNull();
    });

    it('keeps what was typed when the change fails, so it can be corrected', async () => {
      mockUseAuthStore.mockReturnValue({ user: { phone: null } });
      mockSettingsService.changePassword.mockRejectedValue({
        response: { data: { message: 'كلمة المرور الحالية غير صحيحة' } },
      });
      const { getByPlaceholderText, getByText } = await render(
        <ChangePasswordScreen />,
      );

      await fillAndSubmitForm(getByPlaceholderText, getByText);

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalled();
      });
      expect(fieldValues(getByPlaceholderText)).toEqual([
        'old-password',
        'new-password',
        'new-password',
      ]);
    });

    it('starts empty after leaving and coming back', async () => {
      const { getByPlaceholderText } = await render(<ChangePasswordScreen />);
      await fireEvent.changeText(
        getByPlaceholderText(PLACEHOLDERS[0]),
        'old-password',
      );
      await fireEvent.changeText(
        getByPlaceholderText(PLACEHOLDERS[1]),
        'new-password',
      );

      await blurScreen();

      expect(fieldValues(getByPlaceholderText)).toEqual(['', '', '']);
    });

    it('hides a revealed password again after leaving the screen', async () => {
      const { getByPlaceholderText, getAllByLabelText } = await render(
        <ChangePasswordScreen />,
      );
      await fireEvent.changeText(
        getByPlaceholderText(PLACEHOLDERS[0]),
        'old-password',
      );
      await fireEvent.press(getAllByLabelText('إظهار كلمة المرور')[0]);
      expect(getByPlaceholderText(PLACEHOLDERS[0]).props.secureTextEntry).toBe(
        false,
      );

      await blurScreen();

      expect(getByPlaceholderText(PLACEHOLDERS[0]).props.secureTextEntry).toBe(
        true,
      );
    });
  });
});

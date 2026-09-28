import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import DeactivateAccountSheet from '../DeactivateAccountSheet';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: jest.fn(),
  }),
}));

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    requestSuspendOtp: jest.fn(),
    suspendAccount: jest.fn(),
  },
}));

const mockLogout = jest.fn().mockResolvedValue(undefined);
jest.mock('@/shared/store/useAuthStore', () => {
  const store = jest.fn((selector) =>
    selector({
      user: { phone: '+965 1234 5678' },
      logout: mockLogout,
    })
  );
  (store as any).getState = () => ({
    logout: mockLogout,
    user: { phone: '+965 1234 5678' },
  });
  return { useAuthStore: store };
});

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const { View, ScrollView, TextInput } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: jest.fn(),
      }));
      return <View testID="bottom-sheet-modal">{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => (
      <ScrollView>{children}</ScrollView>
    ),
    BottomSheetTextInput: (props: any) => <TextInput {...props} />,
  };
});

describe('DeactivateAccountSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (settingsService.requestSuspendOtp as jest.Mock).mockResolvedValue({
      channel: 'phone',
      destination: '+965 •••• 78',
    });
    (settingsService.suspendAccount as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Account disabled',
    });
  });

  afterEach(cleanup);

  it('renders Step 1 (intro) initially and allows advancing to Step 2', async () => {
    const { getByTestId, getByText } = await render(
      <DeactivateAccountSheet userPhone="+965 1234 5678" />
    );

    expect(getByTestId('deactivate-step-intro')).toBeTruthy();
    expect(getByText('تعطيل الحساب مؤقتًا؟')).toBeTruthy();
    expect(getByText('متابعة التعطيل')).toBeTruthy();
    expect(getByText('تراجع')).toBeTruthy();

    // Advance to Step 2
    await fireEvent.press(getByTestId('deactivate-intro-continue'));

    await waitFor(() => {
      expect(getByTestId('deactivate-step-reasons')).toBeTruthy();
      expect(getByText('ما سبب تعطيل الحساب؟')).toBeTruthy();
    });
  });

  it('allows going back from Step 2 to Step 1', async () => {
    const { getByTestId, queryByTestId } = await render(
      <DeactivateAccountSheet userPhone="+965 1234 5678" />
    );

    await fireEvent.press(getByTestId('deactivate-intro-continue'));
    await waitFor(() => {
      expect(getByTestId('deactivate-step-reasons')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('deactivate-reasons-back'));
    await waitFor(() => {
      expect(getByTestId('deactivate-step-intro')).toBeTruthy();
      expect(queryByTestId('deactivate-step-reasons')).toBeNull();
    });
  });

  it('toggles reasons and shows textarea when "أخرى" is selected', async () => {
    const { getByTestId, queryByTestId } = await render(
      <DeactivateAccountSheet userPhone="+965 1234 5678" />
    );

    // Go to reasons
    await fireEvent.press(getByTestId('deactivate-intro-continue'));
    await waitFor(() => {
      expect(getByTestId('deactivate-step-reasons')).toBeTruthy();
    });

    // Check textarea is not visible initially
    expect(queryByTestId('deactivate-reason-other-input')).toBeNull();

    // Select "أخرى"
    await fireEvent.press(getByTestId('deactivate-reason-other'));
    await waitFor(() => {
      expect(getByTestId('deactivate-reason-other-input')).toBeTruthy();
    });

    // Enter reason text
    await fireEvent.changeText(
      getByTestId('deactivate-reason-other-input'),
      'سفر للخارج'
    );
    expect(getByTestId('deactivate-reason-other-input').props.value).toBe(
      'سفر للخارج'
    );
  });

  it('navigates from Step 2 to Step 3 (OTP) and completes deactivation flow', async () => {
    const onSuccess = jest.fn();

    const { getByTestId, getByText } = await render(
      <DeactivateAccountSheet
        userPhone="+965 1234 5678"
        onSuccess={onSuccess}
      />
    );

    // Step 1 -> Step 2
    await fireEvent.press(getByTestId('deactivate-intro-continue'));
    await waitFor(() => {
      expect(getByTestId('deactivate-step-reasons')).toBeTruthy();
    });

    // Select reason
    await fireEvent.press(getByTestId('deactivate-reason-temp_break'));

    // Submit Step 2
    await fireEvent.press(getByTestId('deactivate-reasons-submit'));

    // Now in Step 3
    await waitFor(() => {
      expect(getByTestId('deactivate-step-otp')).toBeTruthy();
      expect(getByText('تحقق من الرقم')).toBeTruthy();
    });

    // Enter 6 digit OTP
    await fireEvent.changeText(getByTestId('deactivate-otp-input'), '123456');
    await waitFor(() => {
      expect(getByTestId('deactivate-otp-input').props.value).toBe('123456');
    });

    // Confirm
    await fireEvent.press(getByTestId('deactivate-otp-confirm'));

    await waitFor(() => {
      expect(settingsService.suspendAccount).toHaveBeenCalledWith({
        otp: '123456',
        reasons: ['temp_break'],
      });
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/individual-auth');
    });
  });

  it('sends a real code on reaching the code step and shows where it went', async () => {
    const { getByTestId, findByText } = await render(
      <DeactivateAccountSheet userPhone="+965 1234 5678" />
    );

    await fireEvent.press(getByTestId('deactivate-intro-continue'));
    await fireEvent.press(getByTestId('deactivate-reason-other'));
    await fireEvent.changeText(
      getByTestId('deactivate-reason-other-input'),
      'سفر للخارج'
    );
    await fireEvent.press(getByTestId('deactivate-reasons-submit'));

    expect(settingsService.requestSuspendOtp).toHaveBeenCalledTimes(1);
    expect(await findByText(/\+965 •••• 78/)).toBeTruthy();

    await fireEvent.changeText(getByTestId('deactivate-otp-input'), '654321');
    await fireEvent.press(getByTestId('deactivate-otp-confirm'));

    await waitFor(() =>
      expect(settingsService.suspendAccount).toHaveBeenCalledWith({
        otp: '654321',
        reasons: ['other'],
        note: 'سفر للخارج',
      })
    );
  });

  it('keeps the sheet open and clears the code when the server rejects it', async () => {
    (settingsService.suspendAccount as jest.Mock).mockRejectedValue({
      response: { data: { message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' } },
    });
    const onSuccess = jest.fn();
    const { getByTestId, findByTestId } = await render(
      <DeactivateAccountSheet userPhone="+965 1234 5678" onSuccess={onSuccess} />
    );

    await fireEvent.press(getByTestId('deactivate-intro-continue'));
    await fireEvent.press(getByTestId('deactivate-reason-technical'));
    await fireEvent.press(getByTestId('deactivate-reasons-submit'));
    await fireEvent.changeText(getByTestId('deactivate-otp-input'), '000000');
    await fireEvent.press(getByTestId('deactivate-otp-confirm'));

    const error = await findByTestId('deactivate-otp-error');
    expect(error.props.children).toBe('رمز التحقق غير صحيح أو منتهي الصلاحية');
    expect(getByTestId('deactivate-otp-input').props.value).toBe('');
    expect(mockLogout).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('uses the server wait when a code was sent too recently', async () => {
    (settingsService.requestSuspendOtp as jest.Mock).mockRejectedValue({
      response: {
        status: 429,
        data: { code: 'OTP_COOLDOWN', retryAfter: 120, message: 'انتظر' },
      },
    });
    const { getByTestId, findByText, queryByTestId } = await render(
      <DeactivateAccountSheet userPhone="+965 1234 5678" />
    );

    await fireEvent.press(getByTestId('deactivate-intro-continue'));
    await fireEvent.press(getByTestId('deactivate-reason-not_using'));
    await fireEvent.press(getByTestId('deactivate-reasons-submit'));

    expect(await findByText(/02:00/)).toBeTruthy();
    expect(queryByTestId('deactivate-otp-error')).toBeNull();
  });
});

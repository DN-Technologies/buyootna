import { render } from '@testing-library/react-native';

import ChangePasswordOtpSheet from '../ChangePasswordOtpSheet';

// Capture the props handed to BottomSheetModal so the keyboard-handling
// configuration stays pinned (the reported bug was the sheet rendering
// behind the iOS keyboard with the library defaults in place).
const capturedModalProps: Array<Record<string, unknown>> = [];

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    BottomSheetModal: (props: Record<string, unknown>) => {
      capturedModalProps.push(props);
      return <View>{props.children}</View>;
    },
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

describe('ChangePasswordOtpSheet', () => {
  beforeEach(() => {
    capturedModalProps.length = 0;
  });

  it('configures keyboard avoidance so the sheet clears the keyboard', async () => {
    await render(
      <ChangePasswordOtpSheet
        otp=""
        onOtpChange={jest.fn()}
        otpError=""
        maskedPhone="+965 •••• 1234"
        secondsLeft={45}
        isReady={false}
        limitReachedMessage={null}
        onResendOtp={jest.fn()}
        onVerifyOtp={jest.fn()}
        isSubmitting={false}
      />,
    );

    const modalProps = capturedModalProps.at(-1);
    expect(modalProps).toBeDefined();
    expect(modalProps?.keyboardBehavior).toBe('extend');
    expect(modalProps?.keyboardBlurBehavior).toBe('restore');
    expect(modalProps?.android_keyboardInputMode).toBe('adjustResize');
    expect(modalProps?.enableDynamicSizing).toBe(false);
  });

  it('does not autofocus the hidden OTP input at mount (focus is deferred)', async () => {
    const { getByTestId } = await render(
      <ChangePasswordOtpSheet
        otp=""
        onOtpChange={jest.fn()}
        otpError=""
        maskedPhone="+965 •••• 1234"
        secondsLeft={45}
        isReady={false}
        limitReachedMessage={null}
        onResendOtp={jest.fn()}
        onVerifyOtp={jest.fn()}
        isSubmitting={false}
      />,
    );

    expect(getByTestId('otp-hidden-input').props.autoFocus).toBeFalsy();
  });
});

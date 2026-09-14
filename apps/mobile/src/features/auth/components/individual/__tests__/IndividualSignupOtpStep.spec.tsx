import {
  act,
  cleanup,
  fireEvent,
  render,
} from '@testing-library/react-native';

import { IndividualSignupOtpStep } from '../IndividualSignupOtpStep';

describe('IndividualSignupOtpStep', () => {
  afterEach(cleanup);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('masked phone rendering', () => {
    it('masks a +-prefixed phone number', async () => {
      const { getByText } = await render(
        <IndividualSignupOtpStep
          identifier="+96555123456"
          onSubmit={jest.fn()}
          onResendOtp={jest.fn()}
        />,
      );

      expect(
        getByText(/أرسلنا رمز التحقق المكون من 6 أرقام إلى/),
      ).toBeTruthy();
      expect(getByText(/\+965 •••• 3456/)).toBeTruthy();
    });

    it('masks a bare 965-prefixed phone number', async () => {
      const { getByText } = await render(
        <IndividualSignupOtpStep
          identifier="96555123456"
          onSubmit={jest.fn()}
          onResendOtp={jest.fn()}
        />,
      );

      expect(getByText(/\+965 •••• 3456/)).toBeTruthy();
    });

    it('masks a short phone number', async () => {
      const { getByText } = await render(
        <IndividualSignupOtpStep
          identifier="123"
          onSubmit={jest.fn()}
          onResendOtp={jest.fn()}
        />,
      );

      expect(getByText(/•••• 123/)).toBeTruthy();
    });
  });

  describe('masked email rendering', () => {
    it('masks an email identifier, keeping the domain visible', async () => {
      const { getByText } = await render(
        <IndividualSignupOtpStep
          identifier="ali@example.com"
          onSubmit={jest.fn()}
          onResendOtp={jest.fn()}
        />,
      );

      expect(
        getByText(/أرسلنا رمز التحقق المكون من 6 أرقام إلى/),
      ).toBeTruthy();
      expect(getByText(/al•••@example\.com/)).toBeTruthy();
    });
  });

  describe('submit gating', () => {
    it('disables submit until 6 digits are entered, then calls onSubmit(otp)', async () => {
      const onSubmit = jest.fn();
      const { getByDisplayValue, getByText } = await render(
        <IndividualSignupOtpStep
          identifier="+96555123456"
          onSubmit={onSubmit}
          onResendOtp={jest.fn()}
        />,
      );

      await fireEvent.press(getByText('التحقق من الرمز'));
      expect(onSubmit).not.toHaveBeenCalled();

      const hiddenInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      expect(onSubmit).toHaveBeenCalledWith('123456');
    });

    it('keeps submit disabled while isLoading even with a valid otp', async () => {
      const onSubmit = jest.fn();
      const { getByDisplayValue, getByText } = await render(
        <IndividualSignupOtpStep
          identifier="+96555123456"
          onSubmit={onSubmit}
          onResendOtp={jest.fn()}
          isLoading
        />,
      );

      const hiddenInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenInput, '123456');
      await fireEvent.press(getByText('التحقق من الرمز'));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears the otp input when onSubmit resolves false (wrong/expired code)', async () => {
      const onSubmit = jest.fn().mockResolvedValue(false);
      const { getByDisplayValue, getByText } = await render(
        <IndividualSignupOtpStep
          identifier="+96555123456"
          onSubmit={onSubmit}
          onResendOtp={jest.fn()}
        />,
      );

      const hiddenInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenInput, '123456');
      await act(async () => {
        await fireEvent.press(getByText('التحقق من الرمز'));
      });

      expect(onSubmit).toHaveBeenCalledWith('123456');
      expect(getByDisplayValue('')).toBeTruthy();
    });

    it('leaves the otp input alone when onSubmit resolves true', async () => {
      const onSubmit = jest.fn().mockResolvedValue(true);
      const { getByDisplayValue, getByText, queryByDisplayValue } =
        await render(
          <IndividualSignupOtpStep
            identifier="+96555123456"
            onSubmit={onSubmit}
            onResendOtp={jest.fn()}
          />,
        );

      const hiddenInput = getByDisplayValue('');
      await fireEvent.changeText(hiddenInput, '123456');
      await act(async () => {
        await fireEvent.press(getByText('التحقق من الرمز'));
      });

      expect(onSubmit).toHaveBeenCalledWith('123456');
      expect(queryByDisplayValue('123456')).toBeTruthy();
    });
  });

  describe('resend countdown', () => {
    it('hides the resend button while the timer is running, then shows it and starts the next progressive cooldown after a successful resend', async () => {
      const onResendOtp = jest.fn().mockResolvedValue({ success: true });
      const { getByText, queryByText } = await render(
        <IndividualSignupOtpStep
          identifier="+96555123456"
          onSubmit={jest.fn()}
          onResendOtp={onResendOtp}
        />,
      );

      expect(queryByText('إعادة إرسال الرمز')).toBeNull();
      expect(getByText(/إعادة إرسال الرمز خلال/)).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(45000);
      });

      await act(async () => {
        await fireEvent.press(getByText('إعادة إرسال الرمز'));
      });
      expect(onResendOtp).toHaveBeenCalledTimes(1);
      // Backend's first progressive cooldown (30s), not another static 45s.
      expect(getByText('إعادة إرسال الرمز خلال 00:30')).toBeTruthy();
    });

    it('locks the resend button and shows the server message when the daily limit is reached', async () => {
      const onResendOtp = jest.fn().mockResolvedValue({
        success: false,
        code: 'OTP_DAILY_LIMIT',
        message: 'تم تجاوز الحد الأقصى لطلبات رمز التحقق (10 طلبات خلال 24 ساعة). يرجى المحاولة لاحقاً',
      });
      const { getByText, queryByText } = await render(
        <IndividualSignupOtpStep
          identifier="+96555123456"
          onSubmit={jest.fn()}
          onResendOtp={onResendOtp}
        />,
      );

      await act(async () => {
        jest.advanceTimersByTime(45000);
      });

      await act(async () => {
        await fireEvent.press(getByText('إعادة إرسال الرمز'));
      });

      expect(
        getByText(/تم تجاوز الحد الأقصى لطلبات رمز التحقق/),
      ).toBeTruthy();
      expect(queryByText('إعادة إرسال الرمز')).toBeNull();
    });
  });
});

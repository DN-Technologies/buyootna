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
          phone="+96555123456"
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
          phone="96555123456"
          onSubmit={jest.fn()}
          onResendOtp={jest.fn()}
        />,
      );

      expect(getByText(/\+965 •••• 3456/)).toBeTruthy();
    });

    it('masks a short phone number', async () => {
      const { getByText } = await render(
        <IndividualSignupOtpStep
          phone="123"
          onSubmit={jest.fn()}
          onResendOtp={jest.fn()}
        />,
      );

      expect(getByText(/•••• 123/)).toBeTruthy();
    });
  });

  describe('submit gating', () => {
    it('disables submit until 6 digits are entered, then calls onSubmit(otp)', async () => {
      const onSubmit = jest.fn();
      const { getByDisplayValue, getByText } = await render(
        <IndividualSignupOtpStep
          phone="+96555123456"
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
          phone="+96555123456"
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
  });

  describe('resend countdown', () => {
    it('hides the resend button while the timer is running, then shows it and resets after firing', async () => {
      const onResendOtp = jest.fn();
      const { getByText, queryByText } = await render(
        <IndividualSignupOtpStep
          phone="+96555123456"
          onSubmit={jest.fn()}
          onResendOtp={onResendOtp}
        />,
      );

      expect(queryByText('إعادة إرسال الرمز')).toBeNull();
      expect(getByText(/إعادة إرسال الرمز خلال/)).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(45000);
      });

      await fireEvent.press(getByText('إعادة إرسال الرمز'));
      expect(onResendOtp).toHaveBeenCalledTimes(1);
      expect(getByText(/إعادة إرسال الرمز خلال/)).toBeTruthy();
    });
  });
});

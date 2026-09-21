import { act, cleanup, fireEvent, render } from '@testing-library/react-native';

import { ForgotPasswordStep2 } from '../ForgotPasswordStep2';

describe('ForgotPasswordStep2', () => {
  afterEach(cleanup);

  it('strips non-digit characters from the OTP input', async () => {
    const { getByDisplayValue } = await render(
      <ForgotPasswordStep2
        identifier="ali@example.com"
        onSubmit={jest.fn()}
        onResendOtp={jest.fn()}
      />,
    );

    const hiddenInput = getByDisplayValue('');
    await fireEvent.changeText(hiddenInput, 'a1b2c3d4');

    expect(getByDisplayValue('1234')).toBeTruthy();
  });

  it('clears the otp input when onSubmit resolves false (wrong/expired code)', async () => {
    const onSubmit = jest.fn().mockResolvedValue(false);
    const { getByDisplayValue, getByText } = await render(
      <ForgotPasswordStep2
        identifier="ali@example.com"
        onSubmit={onSubmit}
        onResendOtp={jest.fn()}
      />,
    );

    const hiddenInput = getByDisplayValue('');
    await fireEvent.changeText(hiddenInput, '123456');
    await act(async () => {
      await fireEvent.press(getByText('التحقق من الرمز'));
    });

    expect(onSubmit).toHaveBeenCalledWith({ otp: '123456' });
    expect(getByDisplayValue('')).toBeTruthy();
  });

  it('leaves the otp input alone when onSubmit resolves true', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    const { getByDisplayValue, getByText, queryByDisplayValue } =
      await render(
        <ForgotPasswordStep2
          identifier="ali@example.com"
          onSubmit={onSubmit}
          onResendOtp={jest.fn()}
        />,
      );

    const hiddenInput = getByDisplayValue('');
    await fireEvent.changeText(hiddenInput, '123456');
    await act(async () => {
      await fireEvent.press(getByText('التحقق من الرمز'));
    });

    expect(onSubmit).toHaveBeenCalledWith({ otp: '123456' });
    expect(queryByDisplayValue('123456')).toBeTruthy();
  });
});

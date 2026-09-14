import { cleanup, fireEvent, render } from '@testing-library/react-native';

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
});

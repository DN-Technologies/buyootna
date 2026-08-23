import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ForgotPasswordStep1 } from '../ForgotPasswordStep1';

describe('ForgotPasswordStep1', () => {
  afterEach(cleanup);

  it('disables submit until the identifier is non-empty', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = await render(
      <ForgotPasswordStep1 onSubmit={onSubmit} />,
    );

    await fireEvent.press(getByText('إرسال رمز التحقق'));
    expect(onSubmit).not.toHaveBeenCalled();

    await fireEvent.changeText(
      getByPlaceholderText('alisalem@gmail.com'),
      'ali@example.com',
    );
    await fireEvent.press(getByText('إرسال رمز التحقق'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({ identifier: 'ali@example.com' }),
    );
  });
});

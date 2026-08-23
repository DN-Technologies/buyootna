import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { ForgotPasswordStep3 } from '../ForgotPasswordStep3';

describe('ForgotPasswordStep3', () => {
  afterEach(cleanup);

  it('blocks submit when the password is shorter than 8 characters', async () => {
    const onSubmit = jest.fn();
    const { getAllByPlaceholderText, getByText } = await render(
      <ForgotPasswordStep3 onSubmit={onSubmit} />,
    );

    const passwordInputs = getAllByPlaceholderText('**************');
    await fireEvent.changeText(passwordInputs[0], 'short1');
    await fireEvent.changeText(passwordInputs[1], 'short1');
    await fireEvent.press(getByText('تحديث كلمة المرور'));

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit when the passwords do not match', async () => {
    const onSubmit = jest.fn();
    const { getAllByPlaceholderText, getByText } = await render(
      <ForgotPasswordStep3 onSubmit={onSubmit} />,
    );

    const passwordInputs = getAllByPlaceholderText('**************');
    await fireEvent.changeText(passwordInputs[0], 'Password123');
    await fireEvent.changeText(passwordInputs[1], 'Different123');
    await fireEvent.press(getByText('تحديث كلمة المرور'));

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits when both passwords match and meet the length requirement', async () => {
    const onSubmit = jest.fn();
    const { getAllByPlaceholderText, getByText } = await render(
      <ForgotPasswordStep3 onSubmit={onSubmit} />,
    );

    const passwordInputs = getAllByPlaceholderText('**************');
    await fireEvent.changeText(passwordInputs[0], 'Password123');
    await fireEvent.changeText(passwordInputs[1], 'Password123');
    await fireEvent.press(getByText('تحديث كلمة المرور'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});

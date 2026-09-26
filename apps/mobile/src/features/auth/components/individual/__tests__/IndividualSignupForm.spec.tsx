import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { IndividualSignupForm } from '../IndividualSignupForm';

describe('IndividualSignupForm', () => {
  it('renders a single combined phone-or-email identifier field', async () => {
    const { getByText, queryByText } = await render(
      <IndividualSignupForm
        onSubmit={jest.fn()}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );

    expect(getByText('الاسم')).toBeTruthy();
    expect(getByText('رقم الهاتف أو البريد الالكتروني')).toBeTruthy();
    expect(queryByText('البريد الإلكتروني')).toBeNull();
    expect(queryByText('رقم الهاتف')).toBeNull();
  });

  it('submits the identifier field value when the whole form is valid', async () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = await render(
      <IndividualSignupForm
        onSubmit={onSubmit}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );

    fireEvent.changeText(getByPlaceholderText('علي سالم'), 'Ali Salem');
    fireEvent.changeText(getByPlaceholderText('alisalem@gmail.com'), 'ali@example.com');
    const passwordInputs = getAllByPlaceholderText('**************');
    fireEvent.changeText(passwordInputs[0], 'Password123!');
    fireEvent.changeText(passwordInputs[1], 'Password123!');

    fireEvent.press(getByText('إنشاء حساب'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({ name: 'Ali Salem', identifier: 'ali@example.com' }),
    );
  });
});

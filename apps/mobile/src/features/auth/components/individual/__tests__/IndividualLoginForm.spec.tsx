import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';
import { router } from 'expo-router';

import { IndividualLoginForm } from '../IndividualLoginForm';

describe('IndividualLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(cleanup);

  it('submits identifier and password', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = await render(
      <IndividualLoginForm
        onSubmit={onSubmit}
        onOpenProfiles={jest.fn()}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );

    await fireEvent.changeText(
      getByPlaceholderText('alisalem@gmail.com'),
      'ali@example.com',
    );
    await fireEvent.changeText(
      getByPlaceholderText('**************'),
      'password123',
    );
    await fireEvent.press(getByText('تسجيل الدخول'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        identifier: 'ali@example.com',
        password: 'password123',
      }),
    );
  });

  it('has no «تذكري» and no terms box (the terms are on sign-up only)', async () => {
    const { queryByText, queryByTestId } = await render(
      <IndividualLoginForm
        onSubmit={jest.fn()}
        onOpenProfiles={jest.fn()}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );
    expect(queryByText('تذكري')).toBeNull();
    expect(queryByTestId('terms-agreement-checkbox')).toBeNull();
  });

  it('blocks submission when the password is shorter than 6 characters', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = await render(
      <IndividualLoginForm
        onSubmit={onSubmit}
        onOpenProfiles={jest.fn()}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );

    await fireEvent.changeText(
      getByPlaceholderText('alisalem@gmail.com'),
      'ali@example.com',
    );
    await fireEvent.changeText(getByPlaceholderText('**************'), '123');
    await fireEvent.press(getByText('تسجيل الدخول'));

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('navigates to forgot-password when the link is pressed', async () => {
    const { getByText } = await render(
      <IndividualLoginForm
        onSubmit={jest.fn()}
        onOpenProfiles={jest.fn()}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );

    await fireEvent.press(getByText('هل نسيت كلمة المرور؟'));

    expect(router.push).toHaveBeenCalledWith('/(auth)/forgot-password');
  });

  it('calls onOpenProfiles when "المتابعة بحساب محفوظ" is pressed', async () => {
    const onOpenProfiles = jest.fn();
    const { getByText } = await render(
      <IndividualLoginForm
        onSubmit={jest.fn()}
        onOpenProfiles={onOpenProfiles}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
      />,
    );

    await fireEvent.press(getByText('المتابعة بحساب محفوظ'));

    expect(onOpenProfiles).toHaveBeenCalledTimes(1);
  });

  it('calls onGooglePress/onApplePress via the social buttons', async () => {
    const onGooglePress = jest.fn();
    const onApplePress = jest.fn();
    const { getByTestId } = await render(
      <IndividualLoginForm
        onSubmit={jest.fn()}
        onOpenProfiles={jest.fn()}
        onGooglePress={onGooglePress}
        onApplePress={onApplePress}
      />,
    );

    await fireEvent.press(getByTestId('social-auth-google-button'));
    await fireEvent.press(getByTestId('social-auth-apple-button'));

    expect(onGooglePress).toHaveBeenCalledTimes(1);
    expect(onApplePress).toHaveBeenCalledTimes(1);
  });

  it('replaces the submit label with a loading indicator while isLoading', async () => {
    const { queryByText } = await render(
      <IndividualLoginForm
        onSubmit={jest.fn()}
        onOpenProfiles={jest.fn()}
        onGooglePress={jest.fn()}
        onApplePress={jest.fn()}
        isLoading
      />,
    );

    // The submit label is swapped for an ActivityIndicator while loading.
    expect(queryByText('تسجيل الدخول')).toBeNull();
  });
});

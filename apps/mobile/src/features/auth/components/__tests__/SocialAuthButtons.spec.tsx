import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { SocialAuthButtons } from '../SocialAuthButtons';

describe('SocialAuthButtons', () => {
  it('calls onGooglePress when the Google button is tapped', async () => {
    const onGooglePress = jest.fn();
    const onApplePress = jest.fn();

    const { getByTestId } = await render(
      <SocialAuthButtons onGooglePress={onGooglePress} onApplePress={onApplePress} />,
    );

    fireEvent.press(getByTestId('social-auth-google-button'));

    expect(onGooglePress).toHaveBeenCalledTimes(1);
    expect(onApplePress).not.toHaveBeenCalled();
  });

  it('calls onApplePress when the Apple button is tapped', async () => {
    const onGooglePress = jest.fn();
    const onApplePress = jest.fn();

    const { getByTestId } = await render(
      <SocialAuthButtons onGooglePress={onGooglePress} onApplePress={onApplePress} />,
    );

    fireEvent.press(getByTestId('social-auth-apple-button'));

    expect(onApplePress).toHaveBeenCalledTimes(1);
    expect(onGooglePress).not.toHaveBeenCalled();
  });

  it('renders the "or continue with" divider text', async () => {
    const { getByText } = await render(
      <SocialAuthButtons onGooglePress={jest.fn()} onApplePress={jest.fn()} />,
    );

    expect(getByText('أو قم بالتسجيل باستخدام')).toBeTruthy();
  });
});

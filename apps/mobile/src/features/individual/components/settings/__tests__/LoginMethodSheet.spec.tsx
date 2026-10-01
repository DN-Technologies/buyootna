import { cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { createRef } from 'react';

import { settingsService } from '@/shared/api/settings.service';

import LoginMethodSheet, {
  PHONE_NOT_VERIFIED_MESSAGE,
} from '../login-method/LoginMethodSheet';

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    getLoginMethod: jest.fn(),
    setLoginMethod: jest.fn(),
  },
}));

const mockDismiss = jest.fn();
// The sheet loads its data when it opens (onChange to index 0); the mock
// "opens" on mount
jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef(function MockSheet(
      props: any,
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: mockDismiss,
      }));
      // Open once, on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(() => props.onChange?.(0), []);
      return <View testID="bottom-sheet-modal">{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const current = (over: Record<string, unknown> = {}) => ({
  loginMethod: 'BOTH',
  email: 'salem@gmail.com',
  phone: '99998888',
  phoneVerified: true,
  ...over,
});

const selected = (el: any) => el.props.accessibilityState?.selected;

describe('LoginMethodSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (settingsService.setLoginMethod as jest.Mock).mockResolvedValue({
      ...current(),
      message: 'تم تحديث طريقة تسجيل الدخول بنجاح.',
    });
  });
  afterEach(cleanup);

  it('shows the three choices with the current one selected', async () => {
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue(
      current({ loginMethod: 'EMAIL' }),
    );
    const { findByTestId, getByText } = await render(
      <LoginMethodSheet ref={createRef()} onSaved={jest.fn()} />,
    );

    expect(selected(await findByTestId('login-method-EMAIL'))).toBe(true);
    expect(getByText('salem@gmail.com')).toBeTruthy();
    expect(getByText('99998888')).toBeTruthy();
    expect(getByText('البريد الالكتروني أو رقم الهاتف')).toBeTruthy();
  });

  it('saves the new choice, closes and reports the success message', async () => {
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue(current());
    const onSaved = jest.fn();
    const { findByTestId, getByTestId } = await render(
      <LoginMethodSheet ref={createRef()} onSaved={onSaved} />,
    );

    await fireEvent.press(await findByTestId('login-method-PHONE'));
    await fireEvent.press(getByTestId('login-method-save'));

    await waitFor(() =>
      expect(settingsService.setLoginMethod).toHaveBeenCalledWith('PHONE'),
    );
    expect(mockDismiss).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith('تم تحديث طريقة تسجيل الدخول بنجاح.');
  });

  it('an unverified phone stays unselected and explains why', async () => {
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue(
      current({ phoneVerified: false }),
    );
    const { findByTestId, getByText, getByTestId } = await render(
      <LoginMethodSheet ref={createRef()} onSaved={jest.fn()} />,
    );

    const phone = await findByTestId('login-method-PHONE');
    expect(phone.props.accessibilityHint).toBe('غير متاح حالياً');
    await fireEvent.press(phone);

    expect(getByText(PHONE_NOT_VERIFIED_MESSAGE)).toBeTruthy();
    expect(selected(getByTestId('login-method-PHONE'))).toBe(false);
    expect(selected(getByTestId('login-method-BOTH'))).toBe(true);
  });

  it('saving the unchanged choice just closes', async () => {
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue(current());
    const { findByTestId, getByTestId } = await render(
      <LoginMethodSheet ref={createRef()} onSaved={jest.fn()} />,
    );

    await findByTestId('login-method-BOTH');
    await fireEvent.press(getByTestId('login-method-save'));

    expect(settingsService.setLoginMethod).not.toHaveBeenCalled();
    expect(mockDismiss).toHaveBeenCalled();
  });

  it('تراجع closes without saving', async () => {
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue(current());
    const { findByTestId, getByTestId } = await render(
      <LoginMethodSheet ref={createRef()} onSaved={jest.fn()} />,
    );

    await fireEvent.press(await findByTestId('login-method-EMAIL'));
    await fireEvent.press(getByTestId('login-method-cancel'));

    expect(settingsService.setLoginMethod).not.toHaveBeenCalled();
    expect(mockDismiss).toHaveBeenCalled();
  });
});

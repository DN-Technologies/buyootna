import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import CompanyActionsSheet from '../CompanyActionsSheet';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  const BottomSheetModal = React.forwardRef((props: any, _ref: any) => (
    <View>{props.children}</View>
  ));
  BottomSheetModal.displayName = 'BottomSheetModal';
  return {
    __esModule: true,
    BottomSheetModal,
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('CompanyActionsSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists the three things a company can add', async () => {
    const { getByText } = await render(<CompanyActionsSheet />);

    expect(getByText('إضافة جديد')).toBeTruthy();
    expect(getByText('اضافة خدمة')).toBeTruthy();
    expect(getByText('اصدار فاتورة')).toBeTruthy();
    expect(getByText('اضافة مشروع لمعرض الأعمال')).toBeTruthy();
  });

  it.each([
    ['add-service', '/add-service'],
    ['create-invoice', '/create-invoice'],
    ['add-project', '/add-project'],
  ])('opens %s', async (id, href) => {
    const { getByTestId } = await render(
      <CompanyActionsSheet ref={createRef<BottomSheetModal>()} />,
    );

    await fireEvent.press(getByTestId(`company-action-${id}`));
    expect(mockPush).toHaveBeenCalledWith(href);
  });
});

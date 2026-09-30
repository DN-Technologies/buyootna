import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React, { createRef } from 'react';

import { OfficeAddActionSheet } from '@/features/office/components/add';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  const BottomSheetModalComponent = React.forwardRef(
    ({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: jest.fn(),
      }));
      return <View testID="bottom-sheet-modal">{children}</View>;
    },
  );
  return {
    BottomSheetModal: BottomSheetModalComponent,
    BottomSheetView: ({ children }: any) => children,
    BottomSheetBackdrop: () => null,
  };
});

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
}));

describe('OfficeAddActionSheet (Figma Node 4494:141442)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title "إضافة جديد" and two action buttons', async () => {
    const ref = createRef<any>();
    const { getByText, getByTestId } = await render(
      <OfficeAddActionSheet ref={ref} />,
    );

    expect(getByText('إضافة جديد')).toBeTruthy();
    expect(getByText('اضافة اعلان')).toBeTruthy();
    expect(getByText('اضافة خدمة')).toBeTruthy();
    expect(getByTestId('add-listing-action')).toBeTruthy();
    expect(getByTestId('add-service-action')).toBeTruthy();
  });

  it('navigates to /(office)/add when clicking "اضافة اعلان"', async () => {
    const ref = createRef<any>();
    const { getByTestId } = await render(<OfficeAddActionSheet ref={ref} />);

    const addListingButton = getByTestId('add-listing-action');
    fireEvent.press(addListingButton);

    expect(router.push).toHaveBeenCalledWith('/(office)/add');
  });

  it('calls onAddService callback when clicking "اضافة خدمة"', async () => {
    const ref = createRef<any>();
    const onAddServiceMock = jest.fn();
    const { getByTestId } = await render(
      <OfficeAddActionSheet ref={ref} onAddService={onAddServiceMock} />,
    );

    const addServiceButton = getByTestId('add-service-action');
    fireEvent.press(addServiceButton);

    expect(onAddServiceMock).toHaveBeenCalled();
  });

  it('calls onClose callback when clicking close button', async () => {
    const ref = createRef<any>();
    const onCloseMock = jest.fn();
    const { getByTestId } = await render(
      <OfficeAddActionSheet ref={ref} onClose={onCloseMock} />,
    );

    const closeButton = getByTestId('close-sheet-button');
    fireEvent.press(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import ToggleAdsVisibilitySheet from '../ToggleAdsVisibilitySheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const actual = jest.requireActual('@gorhom/bottom-sheet');

  const MockModal = React.forwardRef(function BottomSheetModal(
    { children }: { children?: React.ReactNode },
    ref: any,
  ) {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
      close: jest.fn(),
    }));
    return <>{children}</>;
  });

  function MockView({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  }

  function MockBackdrop() {
    return null;
  }

  return {
    ...actual,
    BottomSheetModal: MockModal,
    BottomSheetView: MockView,
    BottomSheetBackdrop: MockBackdrop,
  };
});

describe('ToggleAdsVisibilitySheet', () => {
  it('renders hide mode content correctly', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByText, getByTestId } = await render(
      <ToggleAdsVisibilitySheet
        ref={ref}
        mode="hide"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(getByText('اخفاء جميع الاعلانات مؤقتا؟')).toBeTruthy();
    expect(
      getByText(
        'سيتم إخفاء جميع الاعلانات من السوق ولن يتمكن العملاء من رؤيتها حالياً. يمكنك إعادة تفعيلها في أي وقت بنقرة واحدة.',
      ),
    ).toBeTruthy();
    expect(getByText('اخفاء الاعلانات')).toBeTruthy();
    expect(getByText('تراجع')).toBeTruthy();

    await fireEvent.press(getByTestId('confirm-hide-ads-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders show mode content correctly', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByText, getByTestId } = await render(
      <ToggleAdsVisibilitySheet
        ref={ref}
        mode="show"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(getByText('اظهار الاعلانات المخفية ؟')).toBeTruthy();
    expect(
      getByText(
        'سيتم اظهار جميع الاعلانات المخفية سيتمكن العملاء من رؤيتها وطلبها.',
      ),
    ).toBeTruthy();
    expect(getByText('اظهار الاعلانات')).toBeTruthy();
    expect(getByText('تراجع')).toBeTruthy();

    await fireEvent.press(getByTestId('confirm-show-ads-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', async () => {
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByTestId } = await render(
      <ToggleAdsVisibilitySheet
        ref={ref}
        mode="hide"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    await fireEvent.press(getByTestId('cancel-toggle-visibility-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

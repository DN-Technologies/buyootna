import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import DeleteAllAlertsSheet from '../DeleteAllAlertsSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const actual = jest.requireActual('@gorhom/bottom-sheet');

  const MockModal = React.forwardRef(function BottomSheetModal(
    { children }: { children?: React.ReactNode },
    _ref: unknown,
  ) {
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

describe('DeleteAllAlertsSheet', () => {
  it('renders confirmation title, description, and action buttons', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByText } = await render(
      <DeleteAllAlertsSheet
        ref={ref}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(getByText('هل أنت متأكد من حذف جميع التنبيهات؟')).toBeTruthy();
    expect(
      getByText(/سيؤدي هذا الإجراء إلى محو جميع التنبيهات الذكية/),
    ).toBeTruthy();
    expect(getByText('حذف جميع التنبيهات')).toBeTruthy();
    expect(getByText('تراجع')).toBeTruthy();
  });

  it('triggers onConfirm when delete all button is pressed', async () => {
    const onConfirm = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByTestId } = await render(
      <DeleteAllAlertsSheet ref={ref} onConfirm={onConfirm} />,
    );

    fireEvent.press(getByTestId('confirm-delete-all-alerts-btn'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers onCancel when cancel button is pressed', async () => {
    const onCancel = jest.fn();
    const ref = createRef<BottomSheetModal>();

    const { getByTestId } = await render(
      <DeleteAllAlertsSheet
        ref={ref}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.press(getByTestId('cancel-delete-all-alerts-btn'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

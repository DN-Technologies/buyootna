import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import type { CompanyRequestItem } from '@/features/company/components/requests/types';
import { sortRequests } from '@/features/individual/hooks/useRequestActions';

import ConfirmActionSheet from '../ConfirmActionSheet';
import { OffersFilterSheet, OffersSortSheet } from '../OffersPickerSheets';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const Modal = React.forwardRef(({ children }: any, _ref: any) => <>{children}</>);
  Modal.displayName = 'BottomSheetModal';
  return {
    BottomSheetModal: Modal,
    BottomSheetView: ({ children }: any) => <>{children}</>,
    BottomSheetBackdrop: () => null,
  };
});

const refWithDismiss = () => {
  const ref = createRef<any>();
  ref.current = { dismiss: jest.fn() };
  return ref;
};

describe('ConfirmActionSheet', () => {
  it('confirms (and closes), or backs out with تراجع', async () => {
    const ref = refWithDismiss();
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId, getByText } = await render(
      <ConfirmActionSheet
        ref={ref}
        title="هل أنت متأكد من حذف جميع عروضك؟"
        description="سيتم حذف جميع عروضك،ولن تتمكن الشركات من التواصل."
        confirmLabel="حذف العروض"
        variant="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(getByText('هل أنت متأكد من حذف جميع عروضك؟')).toBeTruthy();
    await fireEvent.press(getByTestId('confirm-sheet-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(ref.current.dismiss).toHaveBeenCalled();

    await fireEvent.press(getByTestId('confirm-sheet-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows its round icon only when given one', async () => {
    const base = {
      title: 't',
      description: 'd',
      confirmLabel: 'c',
      onConfirm: jest.fn(),
    };
    const { queryByTestId, rerender } = await render(
      <ConfirmActionSheet ref={refWithDismiss()} {...base} />,
    );
    expect(queryByTestId('confirm-sheet-icon')).toBeNull();
    const { Text } = require('react-native');
    await rerender(
      <ConfirmActionSheet ref={refWithDismiss()} {...base} icon={<Text>i</Text>} />,
    );
    expect(queryByTestId('confirm-sheet-icon')).toBeTruthy();
  });
});

describe('OffersSortSheet', () => {
  it('lists الكل / الأحدث أولاً / الأقدم أولاً and picks one', async () => {
    const ref = refWithDismiss();
    const onChange = jest.fn();
    const { getByText, getByTestId } = await render(
      <OffersSortSheet ref={ref} value="all" onChange={onChange} />,
    );
    expect(getByText('الترتيب حسب')).toBeTruthy();
    expect(getByText('الأقدم أولاً')).toBeTruthy();

    await fireEvent.press(getByTestId('offers-sort-newest'));
    expect(onChange).toHaveBeenCalledWith('newest');
    expect(ref.current.dismiss).toHaveBeenCalled();
  });
});

describe('OffersFilterSheet', () => {
  it('toggles service categories, and الكل clears them', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <OffersFilterSheet
        ref={refWithDismiss()}
        categories={['تشطيب', 'الأثاث']}
        selected={['تشطيب']}
        onChange={onChange}
      />,
    );

    await fireEvent.press(getByTestId('offers-filter-الأثاث'));
    expect(onChange).toHaveBeenLastCalledWith(['تشطيب', 'الأثاث']);
    await fireEvent.press(getByTestId('offers-filter-تشطيب'));
    expect(onChange).toHaveBeenLastCalledWith([]);
    await fireEvent.press(getByTestId('offers-filter-all'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('sortRequests', () => {
  const at = (id: string, createdAt: string) =>
    ({ id, createdAt }) as CompanyRequestItem;
  const list = [at('mid', '2026-02-01'), at('new', '2026-03-01'), at('old', '2026-01-01')];

  it('keeps the API order for الكل, and orders by date otherwise', () => {
    expect(sortRequests(list, 'all').map((r) => r.id)).toEqual(['mid', 'new', 'old']);
    expect(sortRequests(list, 'newest').map((r) => r.id)).toEqual(['new', 'mid', 'old']);
    expect(sortRequests(list, 'oldest').map((r) => r.id)).toEqual(['old', 'mid', 'new']);
  });
});

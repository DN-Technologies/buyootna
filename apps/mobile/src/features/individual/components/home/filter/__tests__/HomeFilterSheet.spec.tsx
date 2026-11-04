import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import { EMPTY_FILTERS_BY_TAB, EMPTY_HOME_FILTERS } from '../homeFilter';
import HomeFilterSheet from '../HomeFilterSheet';

const mockDismiss = jest.fn();
jest.mock('@gorhom/bottom-sheet', () => {
  const { View, ScrollView, TextInput } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef(function MockSheet(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: mockDismiss,
      }));
      return (
        <View>
          {props.children}
          {props.footerComponent?.({ animatedFooterPosition: { value: 0 } })}
        </View>
      );
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetFooter: ({ children }: any) => <View>{children}</View>,
    BottomSheetScrollView: ({ children }: any) => <ScrollView>{children}</ScrollView>,
    BottomSheetTextInput: (props: any) => <TextInput {...props} />,
  };
});
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/shared/components/filters/SelectionDrawer', () => () => null);

const renderSheet = (initialTab: 'sale' | 'rent' | 'exchange' | 'offices') => {
  const onApply = jest.fn();
  const onReset = jest.fn();
  const screen = render(
    <HomeFilterSheet
      ref={createRef()}
      initialTab={initialTab}
      applied={EMPTY_FILTERS_BY_TAB}
      onApply={onApply}
      onReset={onReset}
    />,
  );
  return { screen, onApply, onReset };
};

// Figma 5550:138840 / 5550:138765 / 5550:138675: the home's تصفية البحث
// (the home's filter button opened the sort before)
describe('HomeFilterSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('بيع: «عرض النتائج» stays disabled until something is set, then filters', async () => {
    const { screen, onApply } = renderSheet('sale');
    const s = await screen;
    expect(s.getByText('تصفية البحث')).toBeTruthy();
    expect(s.getByTestId('home-filter-apply').props.accessibilityState?.disabled).toBe(true);
    expect(s.queryByText('سنة الطلب')).toBeNull();

    await fireEvent.press(s.getByTestId('home-filter-category-APARTMENT'));
    await fireEvent.press(s.getByTestId('home-filter-category-HOUSE'));
    await fireEvent.changeText(s.getByTestId('home-filter-max-price'), '200,000');
    expect(s.getByTestId('home-filter-max-price').props.value).toBe('200,000');

    await fireEvent.press(s.getByTestId('home-filter-apply'));
    expect(onApply).toHaveBeenCalledWith('sale', {
      ...EMPTY_HOME_FILTERS,
      categories: ['APARTMENT', 'HOUSE'],
      maxPrice: '200000',
    });
    expect(mockDismiss).toHaveBeenCalled();
  });

  it('بدل: the years and الحالة instead of فئة العقار', async () => {
    const { screen, onApply } = renderSheet('sale');
    const s = await screen;
    await fireEvent.press(s.getByTestId('home-filter-tab-exchange'));

    expect(s.getByText('سنة الطلب')).toBeTruthy();
    expect(s.getByText('السنة المطلوبة')).toBeTruthy();
    expect(s.queryByText('فئة العقار')).toBeNull();

    await fireEvent.changeText(s.getByTestId('home-filter-request-year'), '2019');
    await fireEvent.press(s.getByTestId('home-filter-exchange-HOUSE'));
    await fireEvent.press(s.getByTestId('home-filter-apply'));
    expect(onApply).toHaveBeenCalledWith(
      'exchange',
      expect.objectContaining({ requestYear: '2019', exchangeCategory: 'HOUSE' }),
    );
  });

  it('مكاتب: only the location', async () => {
    const { screen } = renderSheet('offices');
    const s = await screen;
    expect(s.getByText('المحافظة')).toBeTruthy();
    expect(s.queryByText('السعر')).toBeNull();
    expect(s.queryByText('فئة العقار')).toBeNull();
  });

  it('«إعادة التعيين» clears that tab and its list', async () => {
    const { screen, onReset } = renderSheet('rent');
    const s = await screen;
    await fireEvent.press(s.getByTestId('home-filter-category-CHALET'));
    expect(s.getByTestId('home-filter-apply').props.accessibilityState?.disabled).toBe(false);

    await fireEvent.press(s.getByTestId('home-filter-reset'));
    expect(onReset).toHaveBeenCalledWith('rent');
    expect(s.getByTestId('home-filter-apply').props.accessibilityState?.disabled).toBe(true);
  });
});

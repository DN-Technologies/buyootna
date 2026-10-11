import { fireEvent, render } from '@testing-library/react-native';

import { showAlert } from '@/shared/utils/alert';

import AlertPropertiesTab, {
  type AlertPropertiesState,
  DEFAULT_ALERT_PROPERTIES_STATE,
} from '../AlertPropertiesTab';

jest.mock('@gorhom/bottom-sheet');
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const renderTab = async (overrides: Partial<AlertPropertiesState> = {}) => {
  const onChange = jest.fn();
  const utils = await render(
    <AlertPropertiesTab
      value={{ ...DEFAULT_ALERT_PROPERTIES_STATE, ...overrides }}
      onChange={onChange}
    />,
  );
  return { ...utils, onChange };
};

describe('AlertPropertiesTab', () => {
  beforeEach(() => jest.clearAllMocks());

  it('switches the operation type', async () => {
    const { getByText, onChange } = await renderTab();

    await fireEvent.press(getByText('ايجار'));

    expect(onChange).toHaveBeenCalledWith('operationType', 'rent');
  });

  it('shows price and area for a sale, writing to price', async () => {
    const { getByText, getByPlaceholderText, queryByText, onChange } =
      await renderTab({ operationType: 'sale' });

    expect(getByText(/^السعر/)).toBeTruthy();
    expect(queryByText(/^قيمة الايجار/)).toBeNull();
    expect(queryByText(/^عدد الغرف/)).toBeNull();

    await fireEvent.changeText(getByPlaceholderText('200,000 د.ك'), '150000');
    await fireEvent.changeText(getByPlaceholderText('300 م2'), '250');

    expect(onChange).toHaveBeenCalledWith('price', '150000');
    expect(onChange).toHaveBeenCalledWith('areaSize', '250');
  });

  it('shows rent value for a rent, writing to rentValue', async () => {
    const { getByText, getByPlaceholderText, queryByText, onChange } =
      await renderTab({ operationType: 'rent', rentValue: '450' });

    expect(getByText(/^قيمة الايجار/)).toBeTruthy();
    expect(queryByText(/^السعر/)).toBeNull();
    expect(getByPlaceholderText('200,000 د.ك').props.value).toBe('450');

    await fireEvent.changeText(getByPlaceholderText('200,000 د.ك'), '500');

    expect(onChange).toHaveBeenCalledWith('rentValue', '500');
  });

  it('shows steppers and years for an exchange instead of price', async () => {
    const { getByText, getByPlaceholderText, queryByText, onChange } =
      await renderTab({ operationType: 'exchange' });

    expect(getByText(/^عدد الغرف/)).toBeTruthy();
    expect(getByText(/^عدد الحمامات/)).toBeTruthy();
    expect(getByText(/^عدد الادوار/)).toBeTruthy();
    expect(queryByText(/^السعر/)).toBeNull();

    await fireEvent.changeText(getByPlaceholderText('2019'), '2026');
    await fireEvent.changeText(getByPlaceholderText('2025'), '2027');

    expect(onChange).toHaveBeenCalledWith('requestYear', '2026');
    expect(onChange).toHaveBeenCalledWith('requiredYear', '2027');
  });

  it('asks for a governorate before opening the area picker', async () => {
    const { getByText } = await renderTab();

    await fireEvent.press(getByText('اختر المنطقة'));

    expect(showAlert).toHaveBeenCalledWith(
      'تنبيه',
      'يرجى اختيار المحافظة أولاً',
      expect.any(Array),
    );
  });

  it('shows the chosen location and amenities', async () => {
    const { getByText } = await renderTab({
      governorate: { id: 'hawally', label: 'حولي' },
      area: { id: 'hawally_2', label: 'السالمية' },
      amenities: [
        { id: 'pool', label: 'حمام سباحة' },
        { id: 'elevator', label: 'مصعد' },
      ],
    });

    expect(getByText('حولي')).toBeTruthy();
    expect(getByText('السالمية')).toBeTruthy();
    expect(getByText('حمام سباحة، مصعد')).toBeTruthy();
    expect(showAlert).not.toHaveBeenCalled();
  });
});

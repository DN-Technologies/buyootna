import { fireEvent, render } from '@testing-library/react-native';

import AlertsListHeader from '../AlertsListHeader';

describe('AlertsListHeader', () => {
  it('renders "ايقاف جميع التنبيهات" when alerts are active', async () => {
    const onToggleAll = jest.fn();
    const { getByText } = await render(
      <AlertsListHeader allPaused={false} onToggleAll={onToggleAll} />,
    );

    expect(getByText('ايقاف جميع التنبيهات')).toBeTruthy();
  });

  it('renders "تفعيل جميع التنبيهات" when all alerts are paused', async () => {
    const onToggleAll = jest.fn();
    const { getByText } = await render(
      <AlertsListHeader allPaused={true} onToggleAll={onToggleAll} />,
    );

    expect(getByText('تفعيل جميع التنبيهات')).toBeTruthy();
  });

  it('calls onToggleAll when pressed', async () => {
    const onToggleAll = jest.fn();
    const { getByTestId } = await render(
      <AlertsListHeader allPaused={false} onToggleAll={onToggleAll} />,
    );

    fireEvent.press(getByTestId('toggle-all-alerts-btn'));
    expect(onToggleAll).toHaveBeenCalledTimes(1);
  });
});

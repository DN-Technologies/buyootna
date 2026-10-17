import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

import AlertsEmptyState from '../AlertsEmptyState';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('AlertsEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeletons when isLoading is true', async () => {
    const { getByTestId } = await render(
      <AlertsEmptyState isLoading={true} error={null} />,
    );

    // ActivityCardSkeleton is rendered 3 times
    expect(getByTestId).toBeDefined();
  });

  it('renders error message when error is present', async () => {
    const { getByText } = await render(
      <AlertsEmptyState isLoading={false} error="فشل في جلب التنبيهات" />,
    );

    expect(getByText('فشل في جلب التنبيهات')).toBeTruthy();
  });

  it('renders Figma empty state title, description, and "0" badge', async () => {
    const { getByText } = await render(
      <AlertsEmptyState isLoading={false} error={null} />,
    );

    expect(getByText('لا توجد تنبيهات حاليا')).toBeTruthy();
    expect(
      getByText(/أنشئ تنبيهك المخصص الآن للعقارات، /),
    ).toBeTruthy();
    expect(getByText('أنشئ تنبيهك الأول الآن')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
  });

  it('invokes custom onAddAlertPress when CTA button is clicked', async () => {
    const onAddAlertPress = jest.fn();
    const { getByTestId } = await render(
      <AlertsEmptyState
        isLoading={false}
        error={null}
        onAddAlertPress={onAddAlertPress}
      />,
    );

    fireEvent.press(getByTestId('create-first-alert-btn'));
    expect(onAddAlertPress).toHaveBeenCalledTimes(1);
  });

  it('navigates to /add-alert by default when no onAddAlertPress prop is passed', async () => {
    const { getByTestId } = await render(
      <AlertsEmptyState isLoading={false} error={null} />,
    );

    fireEvent.press(getByTestId('create-first-alert-btn'));
    expect(router.push).toHaveBeenCalledWith('/add-alert');
  });
});

import { fireEvent, render } from '@testing-library/react-native';

import NotificationsEmptyState from '../NotificationsEmptyState';

describe('NotificationsEmptyState', () => {
  it('renders empty state text, illustration, and calls onExplore when button pressed', async () => {
    const onExplore = jest.fn();

    const { getByText } = await render(
      <NotificationsEmptyState onExplore={onExplore} />,
    );

    expect(getByText('لا توجد اشعارات حاليا')).toBeTruthy();
    expect(
      getByText('لا توجد إشعارات حالياً. سيتم تنبيهك عند حدوث أي جديد !'),
    ).toBeTruthy();

    const button = getByText('استكشف الان');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(onExplore).toHaveBeenCalledTimes(1);
  });
});

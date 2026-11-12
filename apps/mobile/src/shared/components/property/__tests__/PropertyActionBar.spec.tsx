import { render } from '@testing-library/react-native';

import PropertyActionBar from '../PropertyActionBar';

const insets = { top: 0, bottom: 20, left: 0, right: 0 };

// QA: «اتصال» switched off in «طرق التواصل» still showed on the ad page
describe('PropertyActionBar', () => {
  it('shows «اتصال» when the ad offers it', async () => {
    const { getByTestId } = await render(
      <PropertyActionBar insets={insets} onCall={jest.fn()} onChat={jest.fn()} />,
    );
    expect(getByTestId('property-action-call')).toBeTruthy();
  });

  it('has no «اتصال» without onCall', async () => {
    const { queryByTestId } = await render(
      <PropertyActionBar insets={insets} onChat={jest.fn()} />,
    );
    expect(queryByTestId('property-action-call')).toBeNull();
  });
});

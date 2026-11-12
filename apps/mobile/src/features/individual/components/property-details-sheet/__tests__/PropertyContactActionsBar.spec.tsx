import { render } from '@testing-library/react-native';

import PropertyContactActionsBar from '../PropertyContactActionsBar';

// QA: «اتصال» switched off in «طرق التواصل» still showed in the ad sheet
describe('PropertyContactActionsBar', () => {
  it('shows «اتصال» when the ad offers it', async () => {
    const { getByTestId } = await render(
      <PropertyContactActionsBar onCall={jest.fn()} onChat={jest.fn()} />,
    );
    expect(getByTestId('sheet-action-call')).toBeTruthy();
  });

  it('has no «اتصال» without onCall', async () => {
    const { queryByTestId } = await render(
      <PropertyContactActionsBar onChat={jest.fn()} />,
    );
    expect(queryByTestId('sheet-action-call')).toBeNull();
  });
});

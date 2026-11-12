import { render } from '@testing-library/react-native';

import { makeActivityItem } from '../../__tests__/draftFixture';
import ActiveAdCard from '../ActiveAdCard';

jest.mock('expo-image', () =>
  require('../../__tests__/draftFixture').mockExpoImage(),
);

describe('ActiveAdCard status badge', () => {
  it('a hidden ad shows اعلان مخفي instead of نشط', async () => {
    const { getByTestId, getByText, queryByText } = await render(
      <ActiveAdCard property={makeActivityItem({ isHidden: true })} />,
    );

    expect(getByText('اعلان مخفي')).toBeTruthy();
    expect(queryByText('نشط')).toBeNull();
    expect(getByTestId(/active-ad-hidden-badge-/)).toBeTruthy();
  });

  it('a visible ad shows نشط and no hidden badge', async () => {
    const { getByText, queryByText } = await render(
      <ActiveAdCard property={makeActivityItem({ isHidden: false })} />,
    );

    expect(getByText('نشط')).toBeTruthy();
    expect(queryByText('اعلان مخفي')).toBeNull();
  });
});

// QA: the ad's title sat on the left in «نشاطي»
describe('ActiveAdCard title', () => {
  it('reads right to left, starting on the right', async () => {
    const { getByTestId } = await render(
      <ActiveAdCard property={makeActivityItem({})} />,
    );

    expect(getByTestId(/active-ad-title-/)).toHaveStyle({
      writingDirection: 'rtl',
    });
  });
});

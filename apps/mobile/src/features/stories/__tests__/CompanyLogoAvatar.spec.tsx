import { fireEvent, render } from '@testing-library/react-native';

import CompanyListCard from '@/features/individual/components/companies/CompanyListCard';
import { nameInitials } from '@/shared/utils/nameInitials';

import CompanyLogoAvatar from '../components/CompanyLogoAvatar';

describe('CompanyLogoAvatar', () => {
  const ring = (over = {}) => ({
    hasUnseen: true,
    onPress: jest.fn(),
    ...over,
  });

  it('no ring and no button without stories', async () => {
    const { getByTestId, queryByRole, queryByTestId } = await render(
      <CompanyLogoAvatar testID="logo" name="شركة" logoUrl="https://x/y.png" />,
    );
    expect(getByTestId('logo')).toBeTruthy();
    expect(queryByRole('button')).toBeNull();
    expect(queryByTestId('logo-unseen')).toBeNull();
  });

  it('the first letter when there is no logo', async () => {
    const { getByText } = await render(
      <CompanyLogoAvatar name="  شركة" logoUrl="" />,
    );
    expect(getByText(nameInitials('شركة'))).toBeTruthy();
  });

  it.each([
    ['unseen', { hasUnseen: true }],
    ['partial', { hasUnseen: true, partial: true }],
    ['seen', { hasUnseen: false }],
  ])('draws the %s ring', async (state, over) => {
    const { getByTestId } = await render(
      <CompanyLogoAvatar testID="logo" name="شركة" ring={ring(over)} />,
    );
    expect(getByTestId(`logo-${state}`)).toBeTruthy();
  });

  it('a bundled logo stays out of the ring, which only takes URLs', async () => {
    const { getByText } = await render(
      <CompanyLogoAvatar name="شركة" logoUrl={7} ring={ring()} />,
    );
    expect(getByText(nameInitials('شركة'))).toBeTruthy();
  });
});

describe('CompanyListCard story ring', () => {
  const card = {
    id: 'c1',
    name: 'شركة',
    category: 'تشطيب',
    rating: 4,
    reviewsCount: 2,
    projectsCount: '+5',
    lastActivityAt: '2026-11-01T00:00:00.000Z',
    logoUrl: 'https://x/y.png',
  };

  it('tapping the ring opens stories, not the profile', async () => {
    const onPress = jest.fn();
    const ringPress = jest.fn();
    const { getByLabelText } = await render(
      <CompanyListCard
        {...card}
        onPress={onPress}
        storyRing={{ hasUnseen: true, onPress: ringPress }}
      />,
    );
    fireEvent.press(getByLabelText('قصص شركة'));
    expect(ringPress).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('without stories the logo is not a button', async () => {
    const { queryByLabelText } = await render(<CompanyListCard {...card} />);
    expect(queryByLabelText('قصص شركة')).toBeNull();
  });
});

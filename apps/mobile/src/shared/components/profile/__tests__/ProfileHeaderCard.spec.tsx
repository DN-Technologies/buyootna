import { render } from '@testing-library/react-native';

import ProfileHeaderCard from '../ProfileHeaderCard';
import type { UserProfile } from '../types';

const profile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-1',
  name: 'Ebrahim',
  avatarUrl: null,
  rating: 0,
  reviewsCount: 0,
  soldCount: 9,
  totalViews: 1200,
  favoritesCount: 7,
  contactsCount: 3,
  presence: null,
  responseTime: null,
  phone: '',
  joinedDate: '1/2026',
  role: 'INDIVIDUAL',
  ...overrides,
});

describe('ProfileHeaderCard stats', () => {
  it('shows ads, views, saves and contacts, not sold', async () => {
    const { getByText, queryByText } = await render(
      <ProfileHeaderCard userProfile={profile()} propertiesCount={4} />,
    );

    for (const [label, value] of [
      ['الإعلانات', '4'],
      ['المشاهدات', '1,200'],
      ['المفضلة', '7'],
      ['التواصل', '3'],
    ]) {
      expect(getByText(label)).toBeTruthy();
      expect(getByText(value)).toBeTruthy();
    }
    expect(queryByText('العقارات المباعة')).toBeNull();
    expect(queryByText('9')).toBeNull();
  });

  it('shows سرعة الرد only once there is enough to say', async () => {
    const without = await render(
      <ProfileHeaderCard userProfile={profile()} propertiesCount={0} />,
    );
    expect(without.queryByText('سرعة الرد')).toBeNull();
    await without.unmount();

    const withTime = await render(
      <ProfileHeaderCard
        userProfile={profile({
          responseTime: { medianSeconds: 600, sampleSize: 4 },
        })}
        propertiesCount={0}
      />,
    );
    expect(withTime.getByText('سرعة الرد')).toBeTruthy();
  });
});

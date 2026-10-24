import type { PulseItem } from '@/shared/api/pulse.service';

import { pulseView } from '../pulseItems';

const item = (over: Partial<PulseItem>): PulseItem => ({
  kind: 'requestOffers',
  count: 1,
  refId: null,
  tone: 'gold',
  ...over,
});

describe('pulseView', () => {
  it('offers: one opens its request, several the offers tab', () => {
    expect(pulseView(item({ count: 1, refId: 'r1' }))).toMatchObject({
      short: '+1',
      title: 'عرض جديد على طلبك',
      href: { pathname: '/request-details/[id]', params: { id: 'r1' } },
    });
    expect(pulseView(item({ count: 3 }))).toMatchObject({
      title: '3 عروض على طلباتك',
      href: { pathname: '/(individual)/activity', params: { tab: 'offers' } },
    });
  });

  it('expiring ads: days in the notch, «!» on the last day, words in the row', () => {
    const ad = (daysLeft: number, count = 1) =>
      pulseView(item({ kind: 'adExpiring', daysLeft, count }));
    expect(ad(0)).toMatchObject({ short: '!', title: 'إعلانك ينتهي اليوم' });
    expect(ad(1)).toMatchObject({ short: '1', title: 'إعلانك ينتهي غداً' });
    expect(ad(2).title).toBe('إعلانك ينتهي خلال يومين');
    expect(ad(3).title).toBe('إعلانك ينتهي خلال 3 أيام');
    expect(ad(1, 2).title).toBe('2 إعلانات تنتهي خلال أيام');
    expect(ad(1).href).toEqual({
      pathname: '/(individual)/activity',
      params: { tab: 'ads' },
    });
  });

  it('alert matches: one alert opens its matches, several the alerts tab; +9 caps', () => {
    expect(
      pulseView(item({ kind: 'alertMatches', count: 12, refId: 'a1' })),
    ).toMatchObject({ short: '+9', href: '/alert-matches/a1' });
    expect(
      pulseView(item({ kind: 'alertMatches', count: 1 })),
    ).toMatchObject({
      title: 'عقار جديد يطابق تنبيهك',
      href: { pathname: '/(individual)/activity', params: { tab: 'alerts' } },
    });
  });

  it("provider stories open the first author's stories", () => {
    expect(
      pulseView(item({ kind: 'providerStory', count: 2, refId: 'c1' })),
    ).toMatchObject({
      title: '2 قصص جديدة من مفضلتك',
      href: {
        pathname: '/stories/[authorId]',
        params: { authorId: 'c1', source: 'feed' },
      },
    });
  });
});

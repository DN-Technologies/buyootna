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

  it('expiring ads open the office\'s own listings for an office', () => {
    expect(
      pulseView(item({ kind: 'adExpiring', daysLeft: 1 }), 'OFFICE').href,
    ).toBe('/(office)/office-properties');
  });

  describe('company', () => {
    it('private requests: one opens it, several the requests list', () => {
      expect(
        pulseView(item({ kind: 'privateRequests', refId: 'q1' }), 'COMPANY'),
      ).toMatchObject({
        icon: 'briefcase',
        short: '+1',
        title: 'طلب خاص بانتظار ردك',
        href: '/(company)/(requests)/q1',
      });
      expect(
        pulseView(item({ kind: 'privateRequests', count: 3 }), 'COMPANY'),
      ).toMatchObject({
        title: '3 طلبات خاصة بانتظار ردك',
        href: '/(company)/company-requests',
      });
    });

    it('billing: overdue or expired says «!», ending says the days', () => {
      expect(
        pulseView(item({ kind: 'billing', tone: 'red' }), 'COMPANY'),
      ).toMatchObject({
        icon: 'alert-circle',
        short: '!',
        title: 'اشتراكك يحتاج إلى تجديد',
        href: '/company-plans',
      });
      const ending = (d: number) =>
        pulseView(item({ kind: 'billing', daysLeft: d, tone: 'amber' }), 'COMPANY');
      expect(ending(1)).toMatchObject({ short: '1', title: 'ينتهي اشتراكك غداً' });
      expect(ending(2).title).toBe('ينتهي اشتراكك خلال يومين');
      expect(ending(5).title).toBe('ينتهي اشتراكك خلال 5 أيام');
    });

    it('accepted offers and new public requests', () => {
      expect(
        pulseView(item({ kind: 'offerAccepted', refId: 'r1' }), 'COMPANY'),
      ).toMatchObject({ title: 'قبل العميل عرضك', href: '/(company)/(requests)/r1' });
      expect(
        pulseView(item({ kind: 'publicRequests', count: 4 }), 'COMPANY'),
      ).toMatchObject({
        title: '4 طلبات عامة جديدة في تخصصك',
        href: '/(company)/company-requests',
      });
    });
  });

  it('office: ad credits running out open the packages', () => {
    expect(pulseView(item({ kind: 'adCredits', count: 0 }), 'OFFICE')).toMatchObject({
      short: '0',
      title: 'نفد رصيد إعلاناتك',
      href: '/plans',
    });
    expect(pulseView(item({ kind: 'adCredits', count: 1 }), 'OFFICE').title).toBe(
      'بقي إعلان واحد في رصيدك',
    );
  });

  it('my story: its views, time left, and opens my stories', () => {
    expect(
      pulseView(item({ kind: 'myStory', count: 128, refId: 'me', hoursLeft: 9 }), 'OFFICE'),
    ).toMatchObject({
      short: '99+',
      title: 'قصتك: 128 مشاهدة',
      subtitle: 'تنتهي خلال 9 ساعة',
      href: { pathname: '/stories/[authorId]', params: { authorId: 'me', source: 'mine' } },
    });
    expect(
      pulseView(item({ kind: 'myStory', count: 3, hoursLeft: 0 }), 'COMPANY').subtitle,
    ).toBe('تنتهي خلال أقل من ساعة');
  });
});

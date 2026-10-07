import {
  formatPresence,
  formatResponseTime,
} from '@/shared/utils/helpers/activity';

describe('formatPresence', () => {
  const now = new Date('2026-10-07T12:00:00Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();
  const HOUR = 60 * 60 * 1000;

  beforeEach(() => jest.useFakeTimers({ now }));
  afterEach(() => jest.useRealTimers());

  it('shows نشط الآن while the app is open', () => {
    expect(formatPresence({ isOnline: true, lastSeenAt: ago(30 * 24 * HOUR) })).toEqual({
      label: 'نشط الآن',
      isOnline: true,
    });
  });

  it('shows how long ago for up to a week', () => {
    expect(formatPresence({ isOnline: false, lastSeenAt: ago(3 * HOUR) })).toEqual({
      label: 'نشط منذ 3 ساعة',
      isOnline: false,
    });
    expect(formatPresence({ isOnline: false, lastSeenAt: ago(6 * 24 * HOUR) })?.label).toBe(
      'نشط منذ 6 يوم',
    );
  });

  it('hides the badge after a week, or with no activity recorded', () => {
    expect(formatPresence({ isOnline: false, lastSeenAt: ago(8 * 24 * HOUR) })).toBeNull();
    expect(formatPresence({ isOnline: false, lastSeenAt: null })).toBeNull();
    expect(formatPresence(null)).toBeNull();
  });
});

describe('formatResponseTime', () => {
  const at = (minutes: number) => ({ medianSeconds: minutes * 60, sampleSize: 5 });

  it('maps the median reply time to a bucket', () => {
    expect(formatResponseTime(at(5))).toBe('خلال دقائق');
    expect(formatResponseTime(at(20))).toBe('خلال ساعة');
    expect(formatResponseTime(at(90))).toBe('خلال ساعات');
    expect(formatResponseTime(at(10 * 60))).toBe('خلال يوم');
    expect(formatResponseTime(at(30 * 60))).toBe('أكثر من يوم');
  });

  it('shows nothing without enough data', () => {
    expect(formatResponseTime(null)).toBeNull();
    expect(formatResponseTime(undefined)).toBeNull();
  });
});

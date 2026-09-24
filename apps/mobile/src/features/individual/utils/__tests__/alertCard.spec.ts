import {
  formatRelativeMatchTime,
  getAlertChips,
  getAlertTitle,
  getAuctionDateRange,
  toArabicNumerals,
} from '@/features/individual/utils/alertCard';
import type { AlertItem } from '@/shared/api/alerts.service';

const buildAlert = (overrides: Partial<AlertItem> = {}): AlertItem => ({
  id: 'alert-1',
  type: 'PROPERTIES',
  operationType: 'SALE',
  governorateId: 'hawally',
  areaId: 'hawally_1',
  categoryId: 'apartment',
  price: null,
  rentValue: null,
  areaSize: null,
  rooms: null,
  baths: null,
  floors: null,
  requestYear: null,
  requiredYear: null,
  amenities: [],
  startDate: null,
  endDate: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

describe('getAlertTitle', () => {
  it('builds sale and rent titles from category, operation, and area', () => {
    expect(getAlertTitle(buildAlert()).title).toBe('شقة للبيع - السلام');
    expect(
      getAlertTitle(buildAlert({ operationType: 'RENT' })).title,
    ).toBe('شقة للإيجار - السلام');
  });

  it('builds the exchange title', () => {
    expect(
      getAlertTitle(buildAlert({ operationType: 'EXCHANGE' })).title,
    ).toBe('شقة للبدل - السلام');
  });

  it('falls back to generic texts when category and area are missing', () => {
    const { title } = getAlertTitle(
      buildAlert({
        categoryId: null,
        governorateId: 'unknown',
        areaId: null,
        operationType: null,
      }),
    );
    expect(title).toBe('عقار للإيجار - الكويت');
  });

  it('builds the auction title and subtitle', () => {
    expect(
      getAlertTitle(
        buildAlert({
          type: 'AUCTIONS',
          operationType: null,
          governorateId: 'capital',
          areaId: null,
          categoryId: 'commercial',
        }),
      ),
    ).toEqual({ title: 'مزادات وزارة العدل', subtitle: 'مزادات تجاري - العاصمة' });

    expect(
      getAlertTitle(
        buildAlert({
          type: 'AUCTIONS',
          operationType: null,
          governorateId: 'unknown',
          areaId: null,
          categoryId: null,
        }),
      ).subtitle,
    ).toBe('مزادات الأراضي السكنية - محافظة العاصمة');
  });
});

describe('getAlertChips', () => {
  it('lists rent (preferred over price), rooms, baths, size and amenities', () => {
    const chips = getAlertChips(
      buildAlert({
        operationType: 'RENT',
        rentValue: 450,
        price: 90000,
        rooms: 3,
        baths: 2,
        areaSize: 120,
        amenities: ['pool', 'unknown-amenity', 'elevator'],
      }),
    );
    expect(chips).toEqual([
      `حتى ${(450).toLocaleString()} د.ك`,
      '٣ غرف',
      '٢ حمام',
      '120 م²',
      'حمام سباحة',
      'مصعد',
    ]);
  });

  it('shows the price chip when there is no rent value', () => {
    expect(getAlertChips(buildAlert({ price: 90000 }))).toEqual([
      `${(90000).toLocaleString()} د.ك`,
    ]);
  });

  it('shows years and location chips for exchange alerts', () => {
    expect(
      getAlertChips(
        buildAlert({
          operationType: 'EXCHANGE',
          requestYear: 2026,
          requiredYear: null,
          price: 5000,
        }),
      ),
    ).toEqual(['طلب 2026 مع —', 'السلام، حولي']);
  });

  it('returns no chips for auctions', () => {
    expect(
      getAlertChips(buildAlert({ type: 'AUCTIONS', price: 1000, rooms: 2 })),
    ).toEqual([]);
  });
});

describe('getAuctionDateRange', () => {
  const auction = (overrides: Partial<AlertItem>) =>
    buildAlert({ type: 'AUCTIONS', operationType: null, ...overrides });

  it('renders end - start, as shown on the card', () => {
    expect(
      getAuctionDateRange(
        auction({
          startDate: '2026-10-01T12:00:00.000Z',
          endDate: '2026-10-15T12:00:00.000Z',
        }),
      ),
    ).toBe('15/10/2026 - 1/10/2026');
  });

  it('handles a single date', () => {
    expect(
      getAuctionDateRange(auction({ startDate: '2026-10-01T12:00:00.000Z' })),
    ).toBe('1/10/2026');
  });

  it('is null without dates or for non-auction alerts', () => {
    expect(getAuctionDateRange(auction({}))).toBeNull();
    expect(
      getAuctionDateRange(
        buildAlert({ startDate: '2026-10-01T12:00:00.000Z' }),
      ),
    ).toBeNull();
  });
});

describe('formatRelativeMatchTime', () => {
  const now = new Date('2026-09-24T12:00:00.000Z').getTime();
  const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(now));
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [null, 'لا يوجد تطابق بعد'],
    [hoursAgo(-1), 'اخر تطابق منذ قليل'],
    [hoursAgo(0.5), 'اخر تطابق منذ قليل'],
    [hoursAgo(5), 'اخر تطابق منذ 5 ساعات'],
    [hoursAgo(24), 'اخر تطابق منذ يوم'],
    [hoursAgo(48), 'اخر تطابق منذ يومين'],
    [hoursAgo(24 * 7), 'اخر تطابق منذ 7 أيام'],
    [hoursAgo(24 * 30), 'اخر تطابق منذ 30 يوم'],
  ])('formats %p as %p', (date, expected) => {
    expect(formatRelativeMatchTime(date)).toBe(expected);
  });
});

describe('toArabicNumerals', () => {
  it('converts digits and handles empty values', () => {
    expect(toArabicNumerals(2026)).toBe('٢٠٢٦');
    expect(toArabicNumerals(null)).toBe('');
  });
});

import apiClient from '@/shared/api/api';

import { HOME_SORT_OPTIONS } from '../../components/home/homeSort';
import { feedService } from '../feed.service';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGet = apiClient.get as jest.Mock;

describe('feedService.getProperties sorting', () => {
  beforeEach(() => {
    mockGet.mockReset().mockResolvedValue({ data: { data: [], meta: {} } });
  });

  it('offers the orders, in the sheet\'s order', () => {
    expect(HOME_SORT_OPTIONS.map((o) => [o.label, o.value])).toEqual([
      ['الكل', 'DEFAULT'],
      ['المميزة', 'FEATURED'],
      ['الأحدث أولاً', 'NEWEST'],
      ['الأكثر مشاهدة', 'MOST_VIEWED'],
      ['الأقدم أولاً', 'OLDEST'],
      ['السعر (من الأعلى للأقل)', 'PRICE_DESC'],
      ['السعر (من الأقل للأعلى)', 'PRICE_ASC'],
    ]);
  });

  it('asks the server for a price order', async () => {
    await feedService.getProperties('RENT', 1, 10, 'PRICE_ASC');

    expect(mockGet).toHaveBeenCalledWith('/properties', {
      params: { page: 1, limit: 10, type: 'RENT', sort: 'PRICE_ASC' },
    });
  });

  it.each(['FEATURED', 'MOST_VIEWED'] as const)(
    'asks the server for %s',
    async (sort) => {
      await feedService.getProperties('SALE', 1, 10, sort);

      expect(mockGet).toHaveBeenCalledWith('/properties', {
        params: { page: 1, limit: 10, type: 'SALE', sort },
      });
    },
  );

  it('sends no sort for the default order', async () => {
    await feedService.getProperties('SALE', 1, 10);

    expect(mockGet).toHaveBeenCalledWith('/properties', {
      params: { page: 1, limit: 10, type: 'SALE' },
    });
  });

  it('asks the server for newest or oldest first', async () => {
    await feedService.getProperties(undefined, 2, 10, 'OLDEST');

    expect(mockGet).toHaveBeenCalledWith('/properties', {
      params: { page: 2, limit: 10, sort: 'OLDEST' },
    });
  });
});

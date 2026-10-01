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

  it('offers the five orders from the design, in its order', () => {
    expect(HOME_SORT_OPTIONS.map((o) => [o.label, o.value])).toEqual([
      ['الكل', 'DEFAULT'],
      ['الأقدم أولاً', 'OLDEST'],
      ['الأحدث أولاً', 'NEWEST'],
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

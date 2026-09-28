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

  it('offers the three orders from the design, الكل first', () => {
    expect(HOME_SORT_OPTIONS.map((o) => [o.label, o.value])).toEqual([
      ['الكل', 'DEFAULT'],
      ['الأحدث أولاً', 'NEWEST'],
      ['الأقدم أولاً', 'OLDEST'],
    ]);
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

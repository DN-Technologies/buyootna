import { renderHook } from '@testing-library/react-native';

import { useAreaSearch } from '../useAreaSearch';

describe('useAreaSearch', () => {
  it('finds an area from our Kuwait list, spelling variants included', async () => {
    const { result } = await renderHook(() => useAreaSearch('السالميه'));
    expect(result.current[0]).toMatchObject({
      area: 'السالمية',
      governorate: 'حولي',
    });
  });

  it('carries the block from "قطعة N"', async () => {
    const { result } = await renderHook(() => useAreaSearch('السالمية قطعة 5'));
    expect(result.current[0]).toMatchObject({ area: 'السالمية', block: '5' });
  });

  it('ignores one-letter queries', async () => {
    const { result } = await renderHook(() => useAreaSearch('ا'));
    expect(result.current).toEqual([]);
  });
});

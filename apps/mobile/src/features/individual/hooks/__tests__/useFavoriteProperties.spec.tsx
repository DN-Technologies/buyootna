import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

import { favoritesService } from '@/shared/api/favorites.service';
import type { PropertyDetailsDto } from '@/types/property';

import { useFavoriteProperties } from '../useFavoriteProperties';
import { useFavoritesUndo } from '../useFavoritesUndo';

const mockToggleFavorite = jest.fn().mockResolvedValue(undefined);
jest.mock('@/shared/hooks/properties/useFavorites', () => ({
  useFavorites: () => ({ toggleFavorite: mockToggleFavorite }),
}));
jest.mock('@/shared/api/favorites.service', () => ({
  favoritesService: {
    getFavorites: jest.fn(),
    clearAll: jest.fn().mockResolvedValue({ ids: ['a', 'b', 'c'] }),
    restore: jest.fn().mockResolvedValue({ ids: ['a', 'b', 'c'] }),
  },
}));

const ad = (id: string) => ({ id, price: 1 }) as PropertyDetailsDto;

let queryClient: QueryClient;

async function setup() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = await renderHook(
    () => ({ favorites: useFavoriteProperties(), undo: useFavoritesUndo() }),
    { wrapper },
  );
  await waitFor(() =>
    expect(utils.result.current.favorites.properties).toHaveLength(3),
  );
  return utils;
}

const listed = (result: { current: { favorites: { properties: PropertyDetailsDto[] } } }) =>
  result.current.favorites.properties.map((p) => p.id);

describe('useFavoriteProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (favoritesService.getFavorites as jest.Mock).mockResolvedValue({
      data: [ad('a'), ad('b'), ad('c')],
      meta: { total: 3, page: 1, limit: 10, hasNextPage: false },
    });
  });

  afterEach(() => queryClient?.clear());

  it('removes one ad on the server and puts it back on undo', async () => {
    const { result } = await setup();

    await act(async () => {
      result.current.undo.offerUndo(await result.current.favorites.remove(ad('b')));
    });
    expect(listed(result)).toEqual(['a', 'c']);
    expect(mockToggleFavorite).toHaveBeenCalledWith('b');
    expect(result.current.undo.visible).toBe(true);

    await act(() => result.current.undo.undo());
    expect(listed(result)).toEqual(['b', 'a', 'c']);
    expect(mockToggleFavorite).toHaveBeenCalledTimes(2);
    expect(result.current.undo.visible).toBe(false);
  });

  it('"مسح الكل" clears every ad on the server in one call, and undo restores them', async () => {
    const { result } = await setup();

    await act(async () => {
      result.current.undo.offerUndo(await result.current.favorites.removeAll());
    });
    expect(listed(result)).toEqual([]);
    expect(favoritesService.clearAll).toHaveBeenCalledWith('properties');
    expect(mockToggleFavorite).not.toHaveBeenCalled();

    await act(() => result.current.undo.undo());
    expect(listed(result)).toEqual(['a', 'b', 'c']);
    expect(favoritesService.restore).toHaveBeenCalledWith('properties', [
      'a',
      'b',
      'c',
    ]);
  });

  it('dismissing the toast forgets the undo', async () => {
    const { result } = await setup();

    await act(async () => {
      result.current.undo.offerUndo(await result.current.favorites.remove(ad('a')));
    });
    await act(() => result.current.undo.dismiss());
    await act(() => result.current.undo.undo());

    expect(listed(result)).toEqual(['b', 'c']);
    expect(mockToggleFavorite).toHaveBeenCalledTimes(1);
  });
});

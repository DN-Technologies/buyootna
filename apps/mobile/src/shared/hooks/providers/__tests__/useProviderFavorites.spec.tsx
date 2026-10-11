import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

import { favoritesService } from '@/shared/api/favorites.service';
import { showAlert } from '@/shared/utils/alert';

import { useProviderFavorites } from '../useProviderFavorites';

let mockToken: string | null = 'token';
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ token: mockToken })),
}));
jest.mock('@/shared/api/favorites.service', () => ({
  favoritesService: {
    getProviderFavoriteIds: jest.fn(),
    toggleProvider: jest.fn(),
  },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
// The app's shared client wires NetInfo, which Jest can't run
jest.mock('@/shared/api/queryClient', () => {
  const { QueryClient } = jest.requireActual('@tanstack/react-query');
  return { queryClient: new QueryClient() };
});

let queryClient: QueryClient;

async function setup() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useProviderFavorites(), { wrapper });
}

describe('useProviderFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'token';
    (favoritesService.getProviderFavoriteIds as jest.Mock).mockResolvedValue({
      ids: ['c1'],
    });
  });

  afterEach(() => queryClient?.clear());

  it('paints hearts from the saved ids', async () => {
    const { result } = await setup();

    await waitFor(() => expect(result.current.isFavorited('c1')).toBe(true));
    expect(result.current.isFavorited('c2')).toBe(false);
  });

  it('saves a company and keeps the heart on', async () => {
    (favoritesService.toggleProvider as jest.Mock).mockResolvedValue({
      favorited: true,
    });
    const { result } = await setup();
    await waitFor(() => expect(result.current.favoritedIds).toEqual(['c1']));

    await act(() => result.current.toggleFavorite('c2'));

    expect(favoritesService.toggleProvider).toHaveBeenCalledWith('c2');
    // React Query delivers the update on a timer; on a busy CI runner it can
    // land just after act() returns
    await waitFor(() => expect(result.current.isFavorited('c2')).toBe(true));
  });

  it('puts the heart back and explains when saving fails', async () => {
    (favoritesService.toggleProvider as jest.Mock).mockRejectedValue({
      response: { data: { message: 'الشركة أو المكتب غير موجود' } },
    });
    const { result } = await setup();
    await waitFor(() => expect(result.current.favoritedIds).toEqual(['c1']));

    await act(() => result.current.toggleFavorite('c1'));

    await waitFor(() =>
      expect(showAlert).toHaveBeenCalledWith('خطأ', 'الشركة أو المكتب غير موجود'),
    );
    expect(result.current.isFavorited('c1')).toBe(true);
    expect(showAlert).toHaveBeenCalledWith('خطأ', 'الشركة أو المكتب غير موجود');
  });

  it('asks a signed-out user to sign in instead of saving', async () => {
    mockToken = null;
    const { result } = await setup();

    await act(() => result.current.toggleFavorite('c1'));

    expect(favoritesService.toggleProvider).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith(
      'تنبيه',
      'يجب تسجيل الدخول لإضافة الشركات والمكاتب إلى المفضلة',
    );
  });
});

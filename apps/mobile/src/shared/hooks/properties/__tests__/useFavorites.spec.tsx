import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { ReactNode } from 'react';

import { favoritesService } from '@/shared/api/favorites.service';
import { useFavorites } from '@/shared/hooks/properties/useFavorites';
import { useSignInPrompt } from '@/shared/store/useSignInPrompt';

let mockToken: string | null = null;
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ token: mockToken })),
}));
jest.mock('@/shared/api/favorites.service', () => ({
  favoritesService: {
    getFavoriteIds: jest.fn().mockResolvedValue({ ids: [] }),
    toggleFavorite: jest.fn().mockResolvedValue({ favorited: true }),
  },
}));
// The app's shared client wires NetInfo, which Jest can't run
jest.mock('@/shared/api/queryClient', () => {
  const { QueryClient } = jest.requireActual('@tanstack/react-query');
  return { queryClient: new QueryClient() };
});

async function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useFavorites(), { wrapper });
}

// QA: a guest's heart on an ad did nothing at all
describe('useFavorites', () => {
  beforeEach(() => jest.clearAllMocks());

  it("asks a guest to sign in, and saves nothing", async () => {
    mockToken = null;
    const { result } = await setup();
    const before = useSignInPrompt.getState().requestId;

    await act(() => result.current.toggleFavorite('p1'));

    expect(useSignInPrompt.getState().requestId).toBe(before + 1);
    expect(favoritesService.toggleFavorite).not.toHaveBeenCalled();
  });

  it('saves for a signed-in user without asking', async () => {
    mockToken = 'token';
    const { result } = await setup();
    const before = useSignInPrompt.getState().requestId;

    await act(() => result.current.toggleFavorite('p1'));

    expect(favoritesService.toggleFavorite).toHaveBeenCalledWith('p1');
    expect(useSignInPrompt.getState().requestId).toBe(before);
  });
});

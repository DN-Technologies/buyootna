import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';

import PropertyPickerSheet from '@/shared/components/chat/PropertyPickerSheet';

jest.mock('@/shared/hooks/useMyActivity', () => ({
  useMyActivity: () => ({
    isLoading: false,
    data: [
      { id: 'p1', images: [], price: 600, type: 'RENT', category: 'APARTMENT', location: 'الفروانية' },
      { id: 'p2', images: [], price: 500, type: 'RENT', category: 'APARTMENT', isHidden: true },
    ],
  }),
}));
jest.mock('@/shared/api/favorites.service', () => ({
  favoritesService: { getFavorites: jest.fn(async () => ({ data: [] })) },
}));

const setup = async (onPick = jest.fn()) => {
  await render(
    <QueryClientProvider client={new QueryClient()}>
      <PropertyPickerSheet onClose={jest.fn()} onPick={onPick} />
    </QueryClientProvider>,
  );
  return onPick;
};

describe('PropertyPickerSheet', () => {
  // QA: title / price / area hugged the left edge instead of starting at
  // the right, next to the photo
  it('lays the ad text out right-to-left', async () => {
    await setup();
    expect(screen.getByTestId('property-picker-title').props.style).toEqual(
      expect.objectContaining({ writingDirection: 'rtl', textAlign: 'auto' }),
    );
  });

  it('lists my live ads only (not hidden ones) and picks one', async () => {
    const onPick = await setup();
    expect(screen.queryByTestId('property-picker-item-p2')).toBeNull();
    await fireEvent.press(screen.getByTestId('property-picker-item-p1'));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1', price: 600 }));
  });
});

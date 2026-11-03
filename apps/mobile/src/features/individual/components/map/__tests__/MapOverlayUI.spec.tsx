import { fireEvent, render } from '@testing-library/react-native';

import MapOverlayUI from '../MapOverlayUI';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/shared/components/filters/SelectionDrawer', () => () => null);

const props = {
  activeCategory: 'ALL',
  onCategoryChange: jest.fn(),
  searchQuery: '',
  onSearchQueryChange: jest.fn(),
  selectedGovernorates: [],
  selectedAreas: [],
  onGovernoratesChange: jest.fn(),
  onAreasChange: jest.fn(),
  onOpenFilters: jest.fn(),
};

// QA: the map from home had no way back (a dead end)
describe('MapOverlayUI back button', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is labelled «رجوع» and goes back to where the map was opened', async () => {
    mockCanGoBack.mockReturnValue(true);
    const screen = await render(<MapOverlayUI {...props} />);
    const back = screen.getByTestId('map-back');
    expect(back.props.accessibilityLabel).toBe('رجوع');
    await fireEvent.press(back);
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('goes home when there is nothing to go back to (opened by a link)', async () => {
    mockCanGoBack.mockReturnValue(false);
    const screen = await render(<MapOverlayUI {...props} />);
    await fireEvent.press(screen.getByTestId('map-back'));
    expect(mockReplace).toHaveBeenCalledWith('/(individual)/home');
    expect(mockBack).not.toHaveBeenCalled();
  });
});

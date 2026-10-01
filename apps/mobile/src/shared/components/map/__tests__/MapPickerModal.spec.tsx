import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';

import { savedLocationsService } from '@/shared/api/savedLocations.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import MapPickerModal from '../MapPickerModal';

// The real provider waits for native insets before rendering anything
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

const mockSetCamera = jest.fn();
jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { setAccessToken: jest.fn() },
    StyleURL: { Street: 'street', Satellite: 'satellite' },
    MapView: function MockMapView(props: any) {
      return (
        <View testID="map-view" onPress={props.onPress}>
          {props.children}
        </View>
      );
    },
    Camera: React.forwardRef(function MockCamera(_: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ setCamera: mockSetCamera }));
      return null;
    }),
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
}));

jest.mock('@/shared/api/savedLocations.service', () => ({
  savedLocationsService: {
    list: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue({}),
    remove: jest.fn(),
  },
}));

// Mapbox REST: reverse geocoding answers with an address in block 6; the
// area search answers with Salmiya's centre
const reverseFeature = {
  place_type: ['address'],
  text: 'شارع أحمد الجابر',
  address: '12',
  place_name: 'شارع أحمد الجابر 12، قطعة 6، القبلة، الكويت',
};
const mockFetch = jest.fn((url: string) => {
  const isArea = decodeURIComponent(url).includes('السالمية');
  return Promise.resolve({
    json: () =>
      Promise.resolve(
        isArea
          ? { features: [{ center: [48.07, 29.33] }] }
          : { features: [reverseFeature] },
      ),
  });
});

const renderPicker = (onConfirm = jest.fn()) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MapPickerModal visible onClose={jest.fn()} onConfirm={onConfirm} />
    </QueryClientProvider>,
  );

describe('MapPickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.clear();
    global.fetch = mockFetch as unknown as typeof fetch;
    useAuthStore.setState({ token: 'tok', user: { id: 'u1' } } as any);
  });
  afterEach(cleanup);

  it('a tap moves the pin there and the map fills the address details', async () => {
    const onConfirm = jest.fn();
    const { getByTestId, findByTestId } = await renderPicker(onConfirm);

    await act(async () => {
      fireEvent(getByTestId('map-view'), 'press', {
        geometry: { coordinates: [47.98, 29.37] },
      });
    });

    expect(mockSetCamera).toHaveBeenCalledWith(
      expect.objectContaining({ centerCoordinate: [47.98, 29.37] }),
    );
    expect((await findByTestId('picker-details-summary')).props.children).toContain(
      'قطعة 6',
    );

    // The user corrects the house number; the map's guesses stay
    await fireEvent.press(getByTestId('toggle-address-details'));
    await fireEvent.changeText(getByTestId('address-building-input'), '20');
    await fireEvent.press(getByTestId('confirm-location'));

    expect(onConfirm).toHaveBeenCalledWith(
      expect.any(String),
      29.37,
      47.98,
      { block: '6', street: 'شارع أحمد الجابر', building: '20' },
    );
  });

  it('remembers the confirmed place and offers it next time', async () => {
    const first = await renderPicker();
    await act(async () => {
      fireEvent(first.getByTestId('map-view'), 'press', {
        geometry: { coordinates: [47.98, 29.37] },
      });
    });
    await first.findByTestId('picker-details-summary');
    await fireEvent.press(first.getByTestId('confirm-location'));
    await first.unmount();

    const second = await renderPicker();
    await fireEvent(second.getByTestId('map-search-input'), 'focus');
    const recent = await second.findByTestId('map-recent-0');
    mockSetCamera.mockClear();
    await fireEvent.press(recent);

    expect(mockSetCamera).toHaveBeenCalledWith(
      expect.objectContaining({ centerCoordinate: [47.98, 29.37] }),
    );
  });

  it('searching "السالمية قطعة 5" offers the area and fills the block', async () => {
    const onConfirm = jest.fn();
    const { getByTestId, findByTestId } = await renderPicker(onConfirm);

    await fireEvent(getByTestId('map-search-input'), 'focus');
    await fireEvent.changeText(getByTestId('map-search-input'), 'السالمية قطعة 5');
    const area = await findByTestId(/^map-area-/);
    await act(async () => {
      fireEvent.press(area);
    });

    await waitFor(() =>
      expect(mockSetCamera).toHaveBeenCalledWith(
        expect.objectContaining({ centerCoordinate: [48.07, 29.33] }),
      ),
    );
    await waitFor(() => getByTestId('picker-details-summary'));
    await fireEvent.press(getByTestId('confirm-location'));

    expect(onConfirm).toHaveBeenCalledWith(
      expect.any(String),
      29.33,
      48.07,
      expect.objectContaining({ block: '5' }),
    );
  });

  it('saves the spot as العمل', async () => {
    const { getByTestId } = await renderPicker();

    await fireEvent.press(getByTestId('open-save-place'));
    await fireEvent.press(getByTestId('save-place-WORK'));
    await act(async () => {
      fireEvent.press(getByTestId('save-place-confirm'));
    });

    await waitFor(() =>
      expect(savedLocationsService.save).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'WORK' }),
      ),
    );
  });

  it('guests get no save action', async () => {
    useAuthStore.setState({ token: null, user: null } as any);
    const { queryByTestId } = await renderPicker();
    expect(queryByTestId('open-save-place')).toBeNull();
  });
});

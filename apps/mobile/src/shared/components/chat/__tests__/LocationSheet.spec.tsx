import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Linking } from 'react-native';

import LocationSheet from '@/shared/components/chat/LocationSheet';
import { useAlertStore } from '@/shared/store/useAlertStore';

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const permission = Location.requestForegroundPermissionsAsync as jest.Mock;
const position = Location.getCurrentPositionAsync as jest.Mock;

const setup = async () => {
  const onSend = jest.fn();
  await render(<LocationSheet onClose={jest.fn()} onSend={onSend} />);
  return onSend;
};

describe('LocationSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAlertStore.setState({ visible: false });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(async () => ({ json: async () => ({ features: [] }) })) as never;
  });

  // QA (iOS): with location denied the app alert was raised over this sheet,
  // never appeared, and left the whole app frozen
  it('says location is off inside the sheet, without the app alert', async () => {
    permission.mockResolvedValue({ status: 'denied' });
    const onSend = await setup();

    fireEvent.press(screen.getByTestId('location-current'));

    await waitFor(() => expect(screen.getByTestId('location-problem')).toBeTruthy());
    expect(useAlertStore.getState().visible).toBe(false);
    expect(onSend).not.toHaveBeenCalled();
    expect(position).not.toHaveBeenCalled();
    // the sheet stays usable: retry and the map are enabled again
    expect(screen.getByTestId('location-current')).toBeEnabled();
    expect(screen.getByTestId('location-map')).toBeEnabled();
  });

  it('offers the settings page when location is denied', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    permission.mockResolvedValue({ status: 'denied' });
    await setup();

    fireEvent.press(screen.getByTestId('location-current'));
    await waitFor(() => screen.getByTestId('location-open-settings'));
    fireEvent.press(screen.getByTestId('location-open-settings'));

    expect(openSettings).toHaveBeenCalled();
  });

  it('reports a failed fix inside the sheet, with no settings link', async () => {
    permission.mockResolvedValue({ status: 'granted' });
    position.mockRejectedValue(new Error('no fix'));
    await setup();

    fireEvent.press(screen.getByTestId('location-current'));

    await waitFor(() => expect(screen.getByTestId('location-problem')).toBeTruthy());
    expect(screen.queryByTestId('location-open-settings')).toBeNull();
    expect(useAlertStore.getState().visible).toBe(false);
  });

  it('sends the current position once allowed, clearing an earlier notice', async () => {
    permission.mockResolvedValueOnce({ status: 'denied' });
    const onSend = await setup();
    fireEvent.press(screen.getByTestId('location-current'));
    await waitFor(() => screen.getByTestId('location-problem'));

    permission.mockResolvedValueOnce({ status: 'granted' });
    position.mockResolvedValue({ coords: { latitude: 29.33, longitude: 48.07 } });
    fireEvent.press(screen.getByTestId('location-current'));

    await waitFor(() =>
      expect(onSend).toHaveBeenCalledWith({
        latitude: 29.33,
        longitude: 48.07,
        label: 'موقعي الحالي',
      }),
    );
    expect(screen.queryByTestId('location-problem')).toBeNull();
  });
});

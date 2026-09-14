import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';

import { devicesService } from '@/shared/api/devices.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import RegisteredDevicesScreen from '../devices';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// useFocusEffect needs a real NavigationContainer ancestor otherwise. Real
// useFocusEffect defers to the commit phase (it's useEffect-based); calling
// the callback synchronously during render instead (as some other specs in
// this codebase do) is unsafe once a real QueryClientProvider is in the
// tree, since refetch()'s state update during render can spin into an
// infinite render loop. Capture the callback instead and invoke it manually
// once rendering has settled, to simulate a later re-focus.
let capturedFocusEffect: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => {
    capturedFocusEffect = effect;
  },
}));

jest.mock('@/shared/api/devices.service', () => ({
  devicesService: {
    getDevices: jest.fn(),
    revokeDevice: jest.fn(),
    revokeAllDevices: jest.fn(),
  },
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockGetDevices = devicesService.getDevices as jest.Mock;

async function renderScreen(queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})) {
  return {
    queryClient,
    ...(await render(
      <QueryClientProvider client={queryClient}>
        <RegisteredDevicesScreen />
      </QueryClientProvider>,
    )),
  };
}

describe('RegisteredDevicesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedFocusEffect = undefined;
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({ sessionId: 'session-a' }),
    );
  });

  it('shows every session the backend returns, not just the current device', async () => {
    mockGetDevices.mockResolvedValue([
      { id: 'session-a', deviceName: 'iPhone 15 Pro', platform: 'ios', isActive: true, lastActive: '', location: null },
      { id: 'session-b', deviceName: 'Pixel 9', platform: 'android', isActive: true, lastActive: '', location: null },
    ]);

    const { findByText } = await renderScreen();

    expect(await findByText('iPhone 15 Pro')).toBeTruthy();
    expect(await findByText('Pixel 9')).toBeTruthy();
  });

  it('refetches when the screen is re-focused, not just on first mount', async () => {
    mockGetDevices.mockResolvedValue([
      { id: 'session-a', deviceName: 'iPhone 15 Pro', platform: 'ios', isActive: true, lastActive: '', location: null },
    ]);

    await renderScreen();

    await waitFor(() => {
      expect(mockGetDevices).toHaveBeenCalledTimes(1);
    });
    expect(capturedFocusEffect).toBeDefined();

    // Simulates a later re-focus (e.g. a second device having since logged
    // in) without remounting the screen -- this is the exact guarantee the
    // fix adds: without a useFocusEffect-driven refetch, a cached query
    // wouldn't otherwise pick up a device that appeared after the first load.
    capturedFocusEffect?.();

    await waitFor(() => {
      expect(mockGetDevices).toHaveBeenCalledTimes(2);
    });
  });
});

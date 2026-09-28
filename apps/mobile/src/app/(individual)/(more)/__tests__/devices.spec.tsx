import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent,render, waitFor } from '@testing-library/react-native';

import { devicesService } from '@/shared/api/devices.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import RegisteredDevicesScreen from '../devices';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
  }),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
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

// RN's Fabric-era <Modal> hosts its children outside the tree RNTL queries
// can see, and empty Touchables collapse away entirely, so drive the
// confirmation sheets through a plain passthrough with collapsable={false}
// instead (the real modal is presentational; the screen's wiring is what
// these tests assert).
jest.mock('@/features/individual/components/more/LogoutConfirmationModal', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({
      visible,
      onConfirm,
      onClose,
    }: {
      visible: boolean;
      onConfirm: () => void;
      onClose: () => void;
    }) =>
      visible ? (
        <>
          <TouchableOpacity
            testID="confirm-logout"
            collapsable={false}
            onPress={onConfirm}
          />
          <TouchableOpacity
            testID="close-logout"
            collapsable={false}
            onPress={onClose}
          />
        </>
      ) : null,
  };
});

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockGetDevices = devicesService.getDevices as jest.Mock;
const mockRevokeAllDevices = devicesService.revokeAllDevices as jest.Mock;
const mockShowAlert = showAlert as jest.Mock;

let mockLogout: jest.Mock;

async function renderScreen(
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) {
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
    mockLogout = jest.fn().mockResolvedValue(undefined);
    mockUseAuthStore.mockImplementation((selector: any) =>
      selector({
        sessionId: 'session-a',
        logout: mockLogout,
      }),
    );
    // The master "log out everywhere" button renders regardless of list
    // state; only tests that assert on the list need a session payload.
    mockGetDevices.mockResolvedValue([]);
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

  it("shows each device's real location, and no made-up Kuwait fallback", async () => {
    mockGetDevices.mockResolvedValue([
      { id: 'session-a', deviceName: 'iPhone 15 Pro', platform: 'ios', isActive: true, lastActive: '', location: 'Cairo، مصر' },
      { id: 'session-b', deviceName: 'Pixel 9', platform: 'android', isActive: true, lastActive: '', location: null },
    ]);

    const { findByText, queryByText } = await renderScreen();

    expect(await findByText(/Cairo، مصر/)).toBeTruthy();
    expect(await findByText(/موقع غير معروف/)).toBeTruthy();
    expect(queryByText(/الكويت/)).toBeNull();
  });

  it('refetches when the screen is re-focused, not just on first mount', async () => {
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

  // Regression coverage for the reported Critical bug: "log out from all
  // devices" used to only shrink the list -- the current device never
  // cleared its credentials and never left for the login screen.
  it('logging out from all devices also logs the current device out and routes to the auth screen', async () => {
    mockRevokeAllDevices.mockResolvedValue({ count: 1 });

    const { getByTestId } = await renderScreen();

    fireEvent.press(getByTestId('logout-all-devices'));
    await waitFor(() => {
      expect(getByTestId('confirm-logout')).toBeTruthy();
    });
    fireEvent.press(getByTestId('confirm-logout'));

    await waitFor(() => {
      expect(mockRevokeAllDevices).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/individual-auth');
    });
  });

  it('shows an error and stays put when the revoke-all call fails', async () => {
    mockRevokeAllDevices.mockRejectedValue(new Error('network down'));

    const { getByTestId } = await renderScreen();

    fireEvent.press(getByTestId('logout-all-devices'));
    await waitFor(() => {
      expect(getByTestId('confirm-logout')).toBeTruthy();
    });
    fireEvent.press(getByTestId('confirm-logout'));

    await waitFor(() => {
      // A response-less error surfaces as the connectivity message.
      expect(mockShowAlert).toHaveBeenCalledWith(
        'خطأ',
        'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
      );
    });
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalledWith('/(auth)/individual-auth');
  });
});

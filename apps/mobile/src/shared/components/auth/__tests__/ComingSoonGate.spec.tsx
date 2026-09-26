import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';

import ComingSoonGate from '../ComingSoonGate';

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  BottomSheetView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  BottomSheetBackdrop: () => null,
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

type IdentityFixture = {
  id: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const individual: IdentityFixture = {
  id: 'identity-individual',
  type: 'INDIVIDUAL',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const company: IdentityFixture = {
  id: 'identity-company',
  type: 'COMPANY',
  isActive: false,
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

describe('ComingSoonGate', () => {
  const switchIdentity = jest.fn();
  const logout = jest.fn();

  const buildState = (
    identities: IdentityFixture[],
    activeIdentity: IdentityFixture | null,
  ) => ({ identities, activeIdentity, switchIdentity, logout });

  beforeEach(() => {
    jest.clearAllMocks();
    switchIdentity.mockResolvedValue(undefined);
    logout.mockResolvedValue(undefined);
  });

  it('routes the active individual home without switching or logging out', async () => {
    mockUseAuthStore.mockImplementation((selector: (s: any) => any) =>
      selector(buildState([individual], individual)),
    );

    const { getByText } = await render(<ComingSoonGate />);
    fireEvent.press(getByText('العودة للرئيسية'));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/(individual)/home'),
    );
    expect(switchIdentity).not.toHaveBeenCalled();
    expect(logout).not.toHaveBeenCalled();
  });

  it('switches to an inactive individual identity then routes home', async () => {
    mockUseAuthStore.mockImplementation((selector: (s: any) => any) =>
      selector(buildState([company, individual], company)),
    );

    const { getByText } = await render(<ComingSoonGate />);
    fireEvent.press(getByText('العودة للرئيسية'));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/(individual)/home'),
    );
    expect(switchIdentity).toHaveBeenCalledWith('identity-individual');
    expect(logout).not.toHaveBeenCalled();
  });

  it('logs out only when the user has no individual identity at all', async () => {
    mockUseAuthStore.mockImplementation((selector: (s: any) => any) =>
      selector(buildState([company], company)),
    );

    const { getByText } = await render(<ComingSoonGate />);
    fireEvent.press(getByText('العودة للرئيسية'));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith('/(auth)/individual-auth'),
    );
    expect(logout).toHaveBeenCalledTimes(1);
    expect(switchIdentity).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalledWith('/(individual)/home');
  });
});

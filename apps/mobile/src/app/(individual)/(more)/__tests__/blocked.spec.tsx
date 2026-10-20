import { fireEvent, render } from '@testing-library/react-native';

import BlockedAccountsScreen from '@/app/(individual)/(more)/blocked';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => {
    const mockReact = jest.requireActual<typeof import('react')>('react');
    mockReact.useEffect(cb, [cb]);
  },
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));

const mockAskToUnblock = jest.fn();
let mockBlocked: { userId: string; name: string; avatarUrl: string | null }[] = [];
let mockLoading = false;
jest.mock('@/shared/hooks/blocks/useBlocks', () => ({
  useBlockedAccounts: () => ({
    data: mockBlocked,
    isLoading: mockLoading,
    refetch: jest.fn(),
  }),
  useBlockFlow: () => ({ askToBlock: jest.fn(), askToUnblock: mockAskToUnblock }),
}));

describe('Settings › المحظورون', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoading = false;
    mockBlocked = [];
  });

  it('lists the blocked accounts, each with unblock', async () => {
    mockBlocked = [
      { userId: 'u2', name: 'شركة البنيان', avatarUrl: 'https://x/logo.png' },
      { userId: 'u3', name: 'أحمد', avatarUrl: null },
    ];
    const screen = await render(<BlockedAccountsScreen />);
    expect(screen.getByText('المحظورون')).toBeTruthy();
    expect(screen.getByText('شركة البنيان')).toBeTruthy();
    // No picture: the initial
    expect(screen.getByText('أ')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('unblock-u3'));
    expect(mockAskToUnblock).toHaveBeenCalledWith('u3', 'أحمد');
  });

  it('says so when no one is blocked', async () => {
    const screen = await render(<BlockedAccountsScreen />);
    expect(screen.getByTestId('blocked-empty')).toBeTruthy();
    expect(screen.getByText('لا يوجد حسابات محظورة')).toBeTruthy();
  });

  it('back goes back', async () => {
    const screen = await render(<BlockedAccountsScreen />);
    await fireEvent.press(screen.getByLabelText('رجوع'));
    expect(mockBack).toHaveBeenCalled();
  });
});

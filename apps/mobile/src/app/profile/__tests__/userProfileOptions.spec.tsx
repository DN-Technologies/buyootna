import { fireEvent, render } from '@testing-library/react-native';

import UserProfileScreen from '@/app/profile/[id]';
import { useUserProfile } from '@/shared/hooks/auth/useUserProfile';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'ident-1' })),
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
}));
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
}));
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// The screen's parts have their own specs; here, what ⋮ offers
jest.mock('@/shared/components/profile/ProfileHeader', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/components/profile/ProfileListingsTab', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/components/profile/ProfileReviewsTab', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/components/profile/AddReviewSheet', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/components/report/ReportReasonSheet', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/components/property/PropertyActionBar', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/components/profile/ProfileFilterSheet', () => ({
  FilterBottomSheet: () => null,
  SortBottomSheet: () => null,
}));
const mockAuthPresent = jest.fn();
jest.mock('@/shared/components/auth/AuthGuardSheet', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  return forwardRef(function MockAuthGuardSheet(_p: unknown, ref: unknown) {
    useImperativeHandle(ref, () => ({ present: mockAuthPresent }));
    return null;
  });
});
jest.mock('@/shared/hooks/auth/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));
jest.mock('@/shared/hooks/providers/useProfileContact', () => ({
  useProfileContact: () => ({
    canWhatsapp: false,
    handleWhatsapp: jest.fn(),
    handleCall: jest.fn(),
    handleChat: jest.fn(),
  }),
}));
const mockOpenReport = jest.fn();
jest.mock('@/shared/hooks/providers/useOfficeReport', () => ({
  useOfficeReport: () => ({
    reportSheetRef: { current: null },
    handleOpenReport: mockOpenReport,
    handleSubmitReport: jest.fn(),
  }),
}));
const mockAskToBlock = jest.fn();
const mockAskToUnblock = jest.fn();
let mockBlocked: boolean | null = false;
jest.mock('@/shared/hooks/blocks/useBlocks', () => ({
  useBlockStatus: () => mockBlocked,
  useBlockFlow: () => ({
    askToBlock: mockAskToBlock,
    askToUnblock: mockAskToUnblock,
  }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

type Button = { text: string; onPress?: () => void };
const buttons = (): Button[] =>
  (showAlert as jest.Mock).mock.calls.at(-1)?.[2] ?? [];
const tap = (text: string) =>
  buttons()
    .find((b) => b.text === text)
    ?.onPress?.();

const mockProfile = (isOwnProfile = false, loaded = true) =>
  (useUserProfile as jest.Mock).mockReturnValue({
    userProfile: loaded ? { id: 'user-1', name: 'Ebrahim' } : undefined,
    isLoadingProfile: !loaded,
    properties: [],
    isLoadingProperties: false,
    reviews: [],
    reviewSummary: null,
    isOwnProfile,
    handleReviewSubmit: jest.fn(),
    handleToggleLike: jest.fn(),
    handleToggleDislike: jest.fn(),
  });

describe('the ⋮ on a user profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlocked = false;
    mockProfile();
    useAuthStore.setState({ token: 'token' });
  });

  it('opens the options: report, block and cancel', async () => {
    const screen = await render(<UserProfileScreen />);
    await fireEvent.press(screen.getByTestId('profile-options'));

    expect(showAlert).toHaveBeenCalledTimes(1);
    expect(buttons().map((b) => b.text)).toEqual([
      'إبلاغ عن المستخدم',
      'حظر المستخدم',
      'إلغاء',
    ]);
  });

  it('reports and blocks the account behind the profile', async () => {
    const screen = await render(<UserProfileScreen />);
    await fireEvent.press(screen.getByTestId('profile-options'));

    tap('إبلاغ عن المستخدم');
    expect(mockOpenReport).toHaveBeenCalledTimes(1);

    tap('حظر المستخدم');
    expect(mockAskToBlock).toHaveBeenCalledWith(
      { userId: 'user-1', identityId: 'ident-1' },
      'Ebrahim',
    );
  });

  it('once blocked, offers to unblock instead', async () => {
    mockBlocked = true;
    const screen = await render(<UserProfileScreen />);
    await fireEvent.press(screen.getByTestId('profile-options'));

    tap('إلغاء حظر المستخدم');
    expect(mockAskToUnblock).toHaveBeenCalledWith('user-1', 'Ebrahim');
    expect(mockAskToBlock).not.toHaveBeenCalled();
  });

  it('asks a guest to sign in instead', async () => {
    useAuthStore.setState({ token: null });
    const screen = await render(<UserProfileScreen />);
    await fireEvent.press(screen.getByTestId('profile-options'));

    tap('إبلاغ عن المستخدم');
    tap('حظر المستخدم');
    expect(mockOpenReport).not.toHaveBeenCalled();
    expect(mockAskToBlock).not.toHaveBeenCalled();
    expect(mockAuthPresent).toHaveBeenCalledTimes(2);
  });

  it('is not shown on your own profile, or before the profile loads', async () => {
    mockProfile(true);
    const own = await render(<UserProfileScreen />);
    expect(own.queryByTestId('profile-options')).toBeNull();
    await own.unmount();

    mockProfile(false, false);
    const loading = await render(<UserProfileScreen />);
    expect(loading.queryByTestId('profile-options')).toBeNull();
  });
});

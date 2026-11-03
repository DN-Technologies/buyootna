import { fireEvent, render } from '@testing-library/react-native';

import OfficePropertiesScreen from '@/app/(office)/office-properties';
import OfficeGovernorateAdsScreen from '@/app/office-governorate/[governorateId]';
import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useLocalSearchParams: () => ({ governorateId: 'capital' }),
}));
jest.mock('@gorhom/bottom-sheet');
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/shared/hooks/device/useTabBarHeight', () => ({
  useTabBarHeight: () => ({ tabBarHeight: 80, scrollContentBottomPadding: 100 }),
}));

const ad = (over: Partial<ActivityItem>): ActivityItem => ({
  id: 'x',
  images: [],
  price: 100,
  type: 'بيع',
  category: 'APARTMENT',
  status: 'ACTIVE',
  updatedAt: '2026-05-01T00:00:00.000Z',
  governorateId: 'capital',
  listingType: 'SALE',
  ...over,
});

let mockData: Record<string, unknown>;
const mockRun = jest.fn(async () => true);
const mockMarkDone = jest.fn(async () => true);
jest.mock('../useOfficeProperties', () => ({
  useOfficeProperties: () => mockData,
  useOfficeBulkActions: () => ({ run: mockRun, markDone: mockMarkDone, isWorking: false }),
}));

// The toast animates on a timer that would outlive the test
jest.mock('@/features/individual/hooks/useActivityToast', () => ({
  useActivityToast: () => ({
    triggerToast: jest.fn(),
    showToast: false,
    toastMessage: '',
    toastSubtitle: null,
    fadeAnim: { setValue: jest.fn() },
    slideAnim: { setValue: jest.fn() },
  }),
}));

const mockAdActions = {
  handleOpenAd: jest.fn(),
  handlePublishDraft: jest.fn(),
  handleDeleteAd: jest.fn(),
};
jest.mock('@/features/individual/hooks/useAdActions', () => ({
  useAdActions: () => mockAdActions,
}));

// The confirm sheet runs what it confirms at once, and records the texts
const mockConfirms: { kind: string }[] = [];
jest.mock('../components/OfficeAdSheets', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  const Sheets = forwardRef((_props: unknown, ref: unknown) => {
    useImperativeHandle(ref, () => ({
      confirm: (confirm: { kind: string }, onConfirm: () => void) => {
        mockConfirms.push(confirm);
        onConfirm();
      },
    }));
    return null;
  });
  return { __esModule: true, default: Sheets };
});

const setData = (ads: ActivityItem[], drafts: ActivityItem[] = []) => {
  mockData = {
    ads,
    drafts,
    archived: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    dashboard: undefined,
    freeAdsRemaining: 0,
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockConfirms.length = 0;
});

describe('عقارات المكتب', () => {
  it('opens a governorate from its card', async () => {
    setData([ad({ id: 'a' })]);
    const screen = await render(<OfficePropertiesScreen />);
    await fireEvent.press(screen.getByTestId('owner-governorate-capital'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/office-governorate/[governorateId]',
      params: { governorateId: 'capital' },
    });
  });

  it('⋮ on الاعلانات hides every shown ad, after confirming', async () => {
    setData([ad({ id: 'a' }), ad({ id: 'b', isHidden: true })]);
    const screen = await render(<OfficePropertiesScreen />);
    await fireEvent.press(screen.getByTestId('office-properties-menu'));
    expect(screen.getByTestId('options-menu-show-hidden')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('options-menu-hide-all'));
    expect(mockConfirms).toEqual([{ kind: 'hideAll', scope: 'all' }]);
    expect(mockRun).toHaveBeenCalledWith('hide', ['a']);
  });

  it('⋮ on المسودات deletes all drafts', async () => {
    setData([], [ad({ id: 'd1', status: 'DRAFT' }), ad({ id: 'd2', status: 'DRAFT' })]);
    const screen = await render(<OfficePropertiesScreen />);
    await fireEvent.press(screen.getByTestId('office-properties-tabs-drafts'));
    expect(screen.getByText('المسودات (2)')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('office-properties-menu'));
    await fireEvent.press(screen.getByTestId('options-menu-delete-drafts'));
    expect(mockRun).toHaveBeenCalledWith('delete', ['d1', 'd2']);
  });
});

describe('a governorate of the office', () => {
  const ads = [
    ad({ id: 's1' }),
    ad({ id: 's2', isHidden: true }),
    ad({ id: 'r1', listingType: 'RENT' }),
    ad({ id: 'h1', governorateId: 'hawally' }),
  ];

  it('counts each deal and lists this one', async () => {
    setData(ads);
    const screen = await render(<OfficeGovernorateAdsScreen />);
    expect(screen.getByText('بيع (2)')).toBeTruthy();
    expect(screen.getByText('ايجار (1)')).toBeTruthy();
    expect(screen.getByTestId('office-ad-s1')).toBeTruthy();
    expect(screen.queryByTestId('office-ad-r1')).toBeNull();
    await fireEvent.press(screen.getByTestId('governorate-deals-RENT'));
    expect(screen.getByTestId('office-ad-r1')).toBeTruthy();
  });

  it('the menu acts on this governorate only', async () => {
    setData(ads);
    const screen = await render(<OfficeGovernorateAdsScreen />);
    await fireEvent.press(screen.getByTestId('office-properties-menu'));
    await fireEvent.press(screen.getByTestId('options-menu-delete-all'));
    expect(mockConfirms).toEqual([{ kind: 'deleteAll', scope: 'governorate' }]);
    expect(mockRun).toHaveBeenCalledWith('delete', ['s1', 's2', 'r1']);
  });

  it('«تحديد متعدد»: picks ads, then deletes just those', async () => {
    setData(ads);
    const screen = await render(<OfficeGovernorateAdsScreen />);
    await fireEvent.press(screen.getByTestId('office-properties-menu'));
    await fireEvent.press(screen.getByTestId('options-menu-multi-select'));
    await fireEvent.press(screen.getByTestId('office-ad-s2'));
    expect(screen.getByTestId('multi-select-count').props.children).toBe('تم تحديد 1');
    expect(mockAdActions.handleOpenAd).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('multi-select-delete'));
    expect(mockRun).toHaveBeenCalledWith('delete', ['s2']);
    // Done: back to the normal screen
    expect(screen.queryByTestId('multi-select-bar')).toBeNull();
  });

  it('a tap outside selection opens the ad', async () => {
    setData(ads);
    const screen = await render(<OfficeGovernorateAdsScreen />);
    await fireEvent.press(screen.getByTestId('office-ad-s1'));
    expect(mockAdActions.handleOpenAd).toHaveBeenCalledWith(ads[0]);
  });
});

import { render } from '@testing-library/react-native';

import OfficeLayout from '../_layout';

jest.mock('@gorhom/bottom-sheet');

jest.mock('expo-router', () => {
  const TabsComponent = ({ children }: any) => children;
  TabsComponent.Screen = () => null;
  return {
    Tabs: TabsComponent,
    router: { push: jest.fn(), replace: jest.fn() },
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  };
});

jest.mock('@/shared/components/navigation/CustomTabBar', () => 'CustomTabBar');
jest.mock('@/features/office/components/add', () => ({
  OfficeAddActionSheet: 'OfficeAddActionSheet',
}));
jest.mock('@/shared/components/add-listing/QuotaExhaustedSheet', () => 'QuotaExhaustedSheet');
jest.mock('@/shared/components/auth/AuthGuardSheet', () => 'AuthGuardSheet');
jest.mock('@/shared/components/auth/ComingSoonGate', () => 'ComingSoonGate');

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(() => ({ token: 'mock-token' })),
}));

describe('OfficeLayout', () => {
  it('renders office tab navigator without crashing when enabled', async () => {
    const component = await render(<OfficeLayout />);
    expect(component).toBeTruthy();
  });
});

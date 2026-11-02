// With the real router (a mocked one can't lose a navigation): «عرض تنبيهاتي»
// must land on the alerts list from every profile, including a company or
// office whose stack doesn't start in the (individual) group
import { router, Stack, Tabs, useLocalSearchParams } from 'expo-router';
import { act, fireEvent, renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { alertsService } from '@/shared/api/alerts.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import AddAlertScreen from '../index';

// Hoisted above the imports by babel-jest
jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/features/individual/hooks/useMyAlerts', () => ({
  useMyAlerts: () => ({ data: [], isLoading: false }),
}));

jest.mock('@/shared/api/alerts.service', () => ({
  ...jest.requireActual('@/shared/api/alerts.service'),
  alertsService: { create: jest.fn(), update: jest.fn() },
}));

// The form's own fields have their specs: here it only needs a governorate
jest.mock('@/shared/components/add-alert/AlertPropertiesTab', () => {
  const actual = jest.requireActual(
    '@/shared/components/add-alert/AlertPropertiesTab',
  );
  const { Text, TouchableOpacity } = jest.requireActual('react-native');
  return {
    __esModule: true,
    ...actual,
    default: ({ onChange }: { onChange: (k: string, v: unknown) => void }) => (
      <TouchableOpacity onPress={() => onChange('governorate', 'حولي')}>
        <Text>pick-governorate</Text>
      </TouchableOpacity>
    ),
  };
});

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

function ActivityPage() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  return <Text>{`activity:${tab}`}</Text>;
}

// The app's shape: profile groups side by side on the root stack, the form
// and the alerts list tabs of the individual group
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: page('launch-screen'),
  'search/results': page('search-results'),
  '(company)/_layout': () => <Tabs />,
  '(company)/home': page('company-home'),
  '(office)/_layout': () => <Tabs />,
  '(office)/office-home': page('office-home'),
  '(individual)/_layout': () => <Tabs backBehavior="history" />,
  '(individual)/home': page('individual-home'),
  '(individual)/activity': ActivityPage,
  '(individual)/add-alert/_layout': () => <Stack />,
  '(individual)/add-alert/index': AddAlertScreen,
};

function signedInAs(type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE') {
  const state = { token: 'token', activeIdentity: { type } };
  (useAuthStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: typeof state) => unknown) => selector(state),
  );
}

describe('add alert → عرض تنبيهاتي', () => {
  beforeEach(() => {
    (alertsService.create as jest.Mock).mockResolvedValue({ id: 'a1' });
  });

  it.each([
    ['COMPANY', '/(company)/home'],
    ['OFFICE', '/(office)/office-home'],
    ['INDIVIDUAL', '/(individual)/home'],
  ] as const)(
    '%s opens the alerts list from search results',
    async (type, home) => {
      signedInAs(type);
      const screen = await renderRouter(routes, { initialUrl: '/' });
      await act(async () => router.replace(home));
      await act(async () => router.push('/search/results'));
      await act(async () => router.push('/add-alert'));

      await act(async () =>
        fireEvent.press(screen.getByText('pick-governorate')),
      );
      await act(async () => fireEvent.press(screen.getByText('إنشاء تنبيه')));
      await act(async () => fireEvent.press(screen.getByText('عرض تنبيهاتي')));

      expect(screen.getByText('activity:alerts')).toBeTruthy();
    },
  );
});

// With the real router: deleting the company from «اعدادات الحساب» (which
// lives in the (individual) group, pushed over the company tabs) must leave
// no company screen mounted or reachable by back (QA: they stayed until the
// app was restarted)
import { router, Stack, Tabs } from 'expo-router';
import { act, fireEvent, renderRouter } from 'expo-router/testing-library';
import { Text, TouchableOpacity } from 'react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { type AlertButton, showAlert } from '@/shared/utils/alert';

import { useDeleteAccount } from '../useDeleteAccount';

jest.unmock('expo-router');
jest.unmock('react-native-safe-area-context');

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: { deleteAccount: jest.fn(), deleteIdentity: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn() },
}));

const person = { id: 'i-person', type: 'INDIVIDUAL' };
const company = { id: 'i-company', type: 'COMPANY', companyData: { name: 'البنيان' } };

const page = (label: string) =>
  function Page() {
    return <Text>{label}</Text>;
  };

function SettingsPage() {
  const deleteAccount = useDeleteAccount();
  return (
    <TouchableOpacity onPress={deleteAccount}>
      <Text>حذف الحساب</Text>
    </TouchableOpacity>
  );
}

// The app's shape: profile groups side by side on the root stack; settings
// in the (individual) group's «المزيد» stack
const routes = {
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
  index: page('launch-screen'),
  // As the app's: home first, back through the tab history
  '(individual)/_layout': () => (
    <Tabs backBehavior="history">
      <Tabs.Screen name="home" />
    </Tabs>
  ),
  '(individual)/home': page('individual-home'),
  '(individual)/(more)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(individual)/(more)/settings': SettingsPage,
  '(company)/_layout': () => <Tabs />,
  '(company)/home': page('company-home'),
  '(company)/company-more': page('company-more'),
};

const alerts = () => (showAlert as jest.Mock).mock.calls as [string, string, AlertButton[]][];
const press = async (text: string) => {
  const [, , buttons] = alerts()[alerts().length - 1];
  await act(async () => {
    await buttons.find((b) => b.text === text)!.onPress!();
    // let the un-awaited removal finish
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  });
};

describe('deleting the company profile from settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (settingsService.deleteIdentity as jest.Mock).mockResolvedValue({ message: 'ok' });
    (useAuthStore.getState as jest.Mock).mockReturnValue({
      activeIdentity: company,
      identities: [person, company],
      switchIdentity: jest.fn().mockResolvedValue(undefined),
      removeIdentity: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('lands on the personal home with no company screen left behind', async () => {
    const screen = await renderRouter(routes, { initialUrl: '/' });
    await act(async () => router.replace('/(company)/home'));
    await act(async () => router.push('/(company)/company-more'));
    await act(async () => router.push('/settings'));

    await act(async () => fireEvent.press(screen.getByText('حذف الحساب')));
    await press('حذف هذا الملف فقط');
    await press('حذف');

    expect(screen.getByText('individual-home')).toBeTruthy();
    expect(
      screen.queryByText('company-home', { includeHiddenElements: true }),
    ).toBeNull();
    expect(
      screen.queryByText('company-more', { includeHiddenElements: true }),
    ).toBeNull();
    expect(router.canGoBack()).toBe(false);
  });
});

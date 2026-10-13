import { renderHook } from '@testing-library/react-native';

import { settingsService } from '@/shared/api/settings.service';
import { resetToIdentityHome } from '@/shared/navigation/getIdentityHomeRoute';
import { Identity, useAuthStore } from '@/shared/store/useAuthStore';
import { AlertButton, showAlert } from '@/shared/utils/alert';

import { useDeleteAccount } from '../useDeleteAccount';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@/shared/api/settings.service', () => ({
  settingsService: { deleteAccount: jest.fn(), deleteIdentity: jest.fn() },
}));
jest.mock('@/shared/navigation/getIdentityHomeRoute', () => ({
  resetToIdentityHome: jest.fn(),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn() },
}));

const person = { id: 'i-person', type: 'INDIVIDUAL' } as Identity;
const company = {
  id: 'i-company',
  type: 'COMPANY',
  companyData: { name: 'البنيان' },
} as Identity;
const office = { id: 'i-office', type: 'OFFICE', officeData: { name: 'المنار' } } as Identity;

const store = {
  activeIdentity: company as Identity | null,
  identities: [person, company, office],
  switchIdentity: jest.fn(),
  removeIdentity: jest.fn(),
  logout: jest.fn(),
};
const alerts = () => (showAlert as jest.Mock).mock.calls as [string, string, AlertButton[]][];
const press = async (text: string) => {
  const [, , buttons] = alerts()[alerts().length - 1];
  await buttons.find((b) => b.text === text)!.onPress!();
  // let the un-awaited removal finish
  await new Promise((resolve) => setImmediate(resolve));
};
const open = async () => {
  const { result } = await renderHook(() => useDeleteAccount());
  result.current();
};

describe('useDeleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(store, { activeIdentity: company, identities: [person, company, office] });
    store.switchIdentity.mockResolvedValue(undefined);
    (settingsService.deleteIdentity as jest.Mock).mockResolvedValue({ message: 'ok' });
    (settingsService.deleteAccount as jest.Mock).mockResolvedValue({ success: true });
    (useAuthStore.getState as jest.Mock).mockReturnValue(store);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('with one profile, confirms and deletes the whole account as before', async () => {
    Object.assign(store, { activeIdentity: person, identities: [person] });
    await open();

    expect(alerts()[0][0]).toBe('حذف الحساب نهائياً');
    await press('حذف');

    expect(settingsService.deleteAccount).toHaveBeenCalled();
    expect(store.logout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/individual-auth');
    expect(settingsService.deleteIdentity).not.toHaveBeenCalled();
  });

  // QA: deleting from the company profile wiped the personal and office
  // profiles too; there was no way to remove one profile
  it('with several profiles, asks whether to delete this profile or the account', async () => {
    await open();

    const [title, message, buttons] = alerts()[0];
    expect(title).toBe('حذف الحساب');
    expect(message).toContain('ملف الشركة «البنيان»');
    expect(buttons.map((b) => b.text)).toEqual([
      'حذف هذا الملف فقط',
      'حذف الحساب بالكامل',
      'إلغاء',
    ]);
    expect(settingsService.deleteAccount).not.toHaveBeenCalled();
  });

  it('deletes only the profile in use and lands on the personal one', async () => {
    await open();
    await press('حذف هذا الملف فقط');
    expect(alerts()[1][0]).toBe('حذف ملف الشركة «البنيان»');
    await press('حذف');

    expect(store.switchIdentity).toHaveBeenCalledWith('i-person');
    expect(settingsService.deleteIdentity).toHaveBeenCalledWith('i-company');
    expect(store.removeIdentity).toHaveBeenCalledWith('i-company');
    expect(resetToIdentityHome).toHaveBeenCalledWith('INDIVIDUAL');
    expect(settingsService.deleteAccount).not.toHaveBeenCalled();
    expect(store.logout).not.toHaveBeenCalled();
  });

  it('goes back to the profile and shows the reason when the removal is refused', async () => {
    (settingsService.deleteIdentity as jest.Mock).mockRejectedValue({
      response: { data: { message: 'لا يمكن حذف هذه الهوية لأنها تحتوي على 2 عقار(ات).' } },
    });
    await open();
    await press('حذف هذا الملف فقط');
    await press('حذف');

    expect(store.switchIdentity).toHaveBeenNthCalledWith(1, 'i-person');
    expect(store.switchIdentity).toHaveBeenNthCalledWith(2, 'i-company');
    expect(alerts()[2]).toEqual([
      'تعذر حذف الملف',
      'لا يمكن حذف هذه الهوية لأنها تحتوي على 2 عقار(ات).',
    ]);
    expect(store.removeIdentity).not.toHaveBeenCalled();
    expect(resetToIdentityHome).not.toHaveBeenCalled();
  });

  it('deletes nothing when the profile switch fails', async () => {
    store.switchIdentity.mockRejectedValue(new Error('offline'));
    await open();
    await press('حذف هذا الملف فقط');
    await press('حذف');

    expect(settingsService.deleteIdentity).not.toHaveBeenCalled();
    expect(store.removeIdentity).not.toHaveBeenCalled();
  });

  it('still deletes the whole account when that is chosen', async () => {
    await open();
    await press('حذف الحساب بالكامل');
    expect(alerts()[1][0]).toBe('حذف الحساب نهائياً');
    await press('حذف');

    expect(settingsService.deleteAccount).toHaveBeenCalled();
    expect(store.logout).toHaveBeenCalled();
    expect(settingsService.deleteIdentity).not.toHaveBeenCalled();
  });

  it('from the personal profile with a company, moves to the company', async () => {
    Object.assign(store, { activeIdentity: person, identities: [person, company] });
    await open();
    expect(alerts()[0][1]).toContain('الملف الشخصي');
    await press('حذف هذا الملف فقط');
    await press('حذف');

    expect(store.switchIdentity).toHaveBeenCalledWith('i-company');
    expect(settingsService.deleteIdentity).toHaveBeenCalledWith('i-person');
    expect(resetToIdentityHome).toHaveBeenCalledWith('COMPANY');
  });
});

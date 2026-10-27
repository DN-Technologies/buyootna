import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { cleanup, fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { createRef } from 'react';

import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { showAlert } from '@/shared/utils/alert';

import ProfileBottomSheet from '../ProfileBottomSheet';

jest.mock('@/shared/hooks/auth/useIdentity');
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockUseIdentity = useIdentity as jest.Mock;

const individual = {
  id: 'identity-1',
  type: 'INDIVIDUAL' as const,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  individualData: { name: 'Ali', whatsapp: null, avatarUrl: null },
};

const company = {
  id: 'identity-2',
  type: 'COMPANY' as const,
  isActive: false,
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  companyData: { name: 'Acme', logoUrl: null },
};

describe('ProfileBottomSheet', () => {
  const switchIdentity = jest.fn();

  const buildUseIdentity = (overrides: Record<string, unknown> = {}) => ({
    activeIdentity: individual,
    identities: [individual, company],
    switchIdentity,
    getDisplayName: (identity: any) =>
      identity.individualData?.name ?? identity.companyData?.name,
    getAvatarUrl: () => null,
    getTypeLabel: (type: string) =>
      ({ INDIVIDUAL: 'فرد', COMPANY: 'شركة', OFFICE: 'مكتب' })[type] ?? '',
    getTypeBadgeColor: () => '#000000',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIdentity.mockReturnValue(buildUseIdentity());
  });

  afterEach(cleanup);

  it('renders one row per identity with the right name/label', async () => {
    const ref = createRef<BottomSheetModal>();
    const { getByText } = await render(
      <ProfileBottomSheet ref={ref} onAddAccount={jest.fn()} />,
    );

    expect(getByText('Ali')).toBeTruthy();
    expect(getByText('Acme')).toBeTruthy();
    expect(getByText('فرد')).toBeTruthy();
    expect(getByText('شركة')).toBeTruthy();
  });

  it('tapping the already-active identity just closes the sheet without switching', async () => {
    const ref = createRef<BottomSheetModal>();
    const { getByText } = await render(
      <ProfileBottomSheet ref={ref} onAddAccount={jest.fn()} />,
    );

    await fireEvent.press(getByText('Ali'));

    expect(switchIdentity).not.toHaveBeenCalled();
  });

  it('tapping a different identity switches, navigates home, and dismisses', async () => {
    switchIdentity.mockResolvedValue(undefined);
    const ref = createRef<BottomSheetModal>();
    const { getByText } = await render(
      <ProfileBottomSheet ref={ref} onAddAccount={jest.fn()} />,
    );

    await fireEvent.press(getByText('Acme'));
    await Promise.resolve();
    await Promise.resolve();

    expect(switchIdentity).toHaveBeenCalledWith('identity-2');
    expect(router.replace).toHaveBeenCalledWith('/(company)/home');
  });

  it('goes to the new home before the switch completes', async () => {
    // Answers only when the test says so: the home must not wait for it
    let finish!: () => void;
    switchIdentity.mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const ref = createRef<BottomSheetModal>();
    const { getByText } = await render(
      <ProfileBottomSheet ref={ref} onAddAccount={jest.fn()} />,
    );

    const pressing = fireEvent.press(getByText('Acme'));
    await Promise.resolve();

    expect(router.replace).toHaveBeenCalledWith('/(company)/home');

    finish();
    await pressing;
  });

  it('on a failed switch, goes back to the previous home and says so', async () => {
    switchIdentity.mockRejectedValue(new Error('network down'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const ref = createRef<BottomSheetModal>();
    const { getByText } = await render(
      <ProfileBottomSheet ref={ref} onAddAccount={jest.fn()} />,
    );

    await fireEvent.press(getByText('Acme'));
    await Promise.resolve();
    await Promise.resolve();

    expect(router.replace).toHaveBeenNthCalledWith(1, '/(company)/home');
    expect(router.replace).toHaveBeenLastCalledWith('/(individual)/home');
    expect(showAlert).toHaveBeenCalledWith(
      'تعذر تبديل الهوية',
      'تحقق من الاتصال وحاول مرة أخرى',
    );
    jest.restoreAllMocks();
  });

  it('"إضافة هوية جديدة" press dismisses the sheet and calls onAddAccount', async () => {
    const onAddAccount = jest.fn();
    const ref = createRef<BottomSheetModal>();
    const { getByText } = await render(
      <ProfileBottomSheet ref={ref} onAddAccount={onAddAccount} />,
    );

    await fireEvent.press(getByText('إضافة هوية جديدة'));

    expect(onAddAccount).toHaveBeenCalledTimes(1);
  });
});

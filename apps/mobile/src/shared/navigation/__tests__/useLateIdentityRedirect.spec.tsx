import { renderHook } from '@testing-library/react-native';

import { useLateIdentityRedirect } from '../useLateIdentityRedirect';

let mockType: string | undefined;
let mockSegments: string[] = [];
jest.mock('expo-router', () => ({ useSegments: () => mockSegments }));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (select: (s: unknown) => unknown) =>
    select({ activeIdentity: mockType ? { type: mockType } : null }),
}));
const mockReset = jest.fn();
jest.mock('../getIdentityHomeRoute', () => ({
  resetToIdentityHome: (type: string) => mockReset(type),
}));

describe('useLateIdentityRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockType = undefined;
    mockSegments = ['(individual)', 'home'];
  });

  it('launch fell back to individual, then the profile loads as a company: its home', async () => {
    const { rerender } = await renderHook(() => useLateIdentityRedirect());
    expect(mockReset).not.toHaveBeenCalled();
    mockType = 'COMPANY';
    await rerender({});
    expect(mockReset).toHaveBeenCalledWith('COMPANY');
  });

  it('a normal launch (known before leaving the splash) is left to it', async () => {
    mockSegments = [];
    mockType = 'OFFICE';
    await renderHook(() => useLateIdentityRedirect());
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('a company later opening a shared (individual) screen stays there', async () => {
    mockSegments = ['(company)', 'home'];
    mockType = 'COMPANY';
    const { rerender } = await renderHook(() => useLateIdentityRedirect());
    mockSegments = ['(individual)', 'notification-list'];
    await rerender({});
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('an individual profile is never moved', async () => {
    const { rerender } = await renderHook(() => useLateIdentityRedirect());
    mockType = 'INDIVIDUAL';
    await rerender({});
    expect(mockReset).not.toHaveBeenCalled();
  });
});

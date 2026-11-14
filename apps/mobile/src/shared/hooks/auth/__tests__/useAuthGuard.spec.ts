import { act, renderHook } from '@testing-library/react-native';

import { useAuthGuard } from '@/shared/hooks/auth/useAuthGuard';

let mockToken: string | null = null;
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) =>
    selector({ token: mockToken }),
}));

// @gorhom/bottom-sheet's modal status, as presentSheet reads it
const MINIMIZED = 3;
const fakeSheet = (status: number) => ({
  status: { current: status },
  present: jest.fn(),
  dismiss: jest.fn(),
});

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(global, 'requestAnimationFrame')
    .mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// QA: a guest's «شارك برأيك» showed no sign-in prompt
describe('useAuthGuard', () => {
  it('asks a guest to sign in instead of running the action', async () => {
    mockToken = null;
    const { result } = await renderHook(() => useAuthGuard());
    const sheet = fakeSheet(0);
    (result.current.authSheetRef as { current: unknown }).current = sheet;
    const action = jest.fn();

    await act(async () => result.current.guardAction(action));

    expect(action).not.toHaveBeenCalled();
    expect(sheet.present).toHaveBeenCalledTimes(1);
  });

  it('still opens it after the guest swiped it closed (no dead tap)', async () => {
    mockToken = null;
    const { result } = await renderHook(() => useAuthGuard());
    const sheet = fakeSheet(MINIMIZED);
    (result.current.authSheetRef as { current: unknown }).current = sheet;

    await act(async () => result.current.guardAction(jest.fn()));

    // A leftover sheet is cleared, then presented fresh
    expect(sheet.dismiss).toHaveBeenCalledTimes(1);
    expect(sheet.present).toHaveBeenCalledTimes(1);
  });

  it('runs the action for a signed-in user, with no sheet', async () => {
    mockToken = 'token';
    const { result } = await renderHook(() => useAuthGuard());
    const sheet = fakeSheet(0);
    (result.current.authSheetRef as { current: unknown }).current = sheet;
    const action = jest.fn();

    await act(async () => result.current.guardAction(action));

    expect(action).toHaveBeenCalledTimes(1);
    expect(sheet.present).not.toHaveBeenCalled();
  });
});

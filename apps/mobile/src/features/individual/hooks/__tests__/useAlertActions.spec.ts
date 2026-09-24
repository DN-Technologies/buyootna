import { act, renderHook } from '@testing-library/react-native';

import { AlertItem, alertsService } from '@/shared/api/alerts.service';
import { showAlert } from '@/shared/utils/alert';

import { useAlertActions } from '../useAlertActions';

jest.mock('@/shared/api/alerts.service', () => ({
  alertsService: {
    remove: jest.fn(),
    setActive: jest.fn(),
    setAllActive: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const buildAlerts = (a1Active = true, a2Active = true) =>
  [
    { id: 'a1', isActive: a1Active },
    { id: 'a2', isActive: a2Active },
  ] as AlertItem[];

async function setup(alerts: AlertItem[] = buildAlerts()) {
  const refetchAlerts = jest.fn();
  const triggerToast = jest.fn();
  const utils = await renderHook(() =>
    useAlertActions({ alerts, refetchAlerts, triggerToast }),
  );
  return { ...utils, refetchAlerts, triggerToast };
}

describe('useAlertActions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads the active state from the server data', async () => {
    const { result } = await setup(buildAlerts(true, false));

    expect(result.current.isAlertActive('a1')).toBe(true);
    expect(result.current.isAlertActive('a2')).toBe(false);
    expect(result.current.allAlertsPaused).toBe(false);
  });

  it('treats alerts from an older API (no isActive) as active', async () => {
    const { result } = await setup([{ id: 'a1' }] as AlertItem[]);
    expect(result.current.isAlertActive('a1')).toBe(true);
  });

  it('persists a single toggle, flipping it immediately', async () => {
    let resolveRequest: () => void = () => {};
    (alertsService.setActive as jest.Mock).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result, refetchAlerts } = await setup();

    let pending: Promise<unknown> | undefined;
    await act(async () => {
      pending = result.current.handleToggleAlertActive('a1');
    });
    // Optimistic: already paused while the request is in flight
    expect(result.current.isAlertActive('a1')).toBe(false);
    expect(alertsService.setActive).toHaveBeenCalledWith('a1', false);

    await act(async () => {
      resolveRequest();
      await pending;
    });
    expect(refetchAlerts).toHaveBeenCalled();
  });

  it('snaps back and shows an error when the toggle fails', async () => {
    (alertsService.setActive as jest.Mock).mockRejectedValue(new Error('x'));
    const { result, refetchAlerts } = await setup();

    await act(() => result.current.handleToggleAlertActive('a1'));

    expect(result.current.isAlertActive('a1')).toBe(true);
    expect(showAlert).toHaveBeenCalledWith('خطأ', expect.any(String));
    expect(refetchAlerts).not.toHaveBeenCalled();
  });

  it('pauses all when any alert is active', async () => {
    (alertsService.setAllActive as jest.Mock).mockResolvedValue({ count: 2 });
    const { result } = await setup(buildAlerts(true, false));

    await act(() => result.current.handleToggleAllAlerts());

    expect(alertsService.setAllActive).toHaveBeenCalledWith(false);
  });

  it('resumes all when every alert is paused', async () => {
    (alertsService.setAllActive as jest.Mock).mockResolvedValue({ count: 2 });
    const { result } = await setup(buildAlerts(false, false));
    expect(result.current.allAlertsPaused).toBe(true);

    await act(() => result.current.handleToggleAllAlerts());

    expect(alertsService.setAllActive).toHaveBeenCalledWith(true);
  });

  it('deletes the chosen alert, then shows a toast and refetches', async () => {
    (alertsService.remove as jest.Mock).mockResolvedValue(undefined);
    const { result, refetchAlerts, triggerToast } = await setup();

    await act(() => result.current.handleDeleteAlert('a2'));
    await act(() => result.current.handleConfirmDeleteAlert());

    expect(alertsService.remove).toHaveBeenCalledWith('a2');
    expect(triggerToast).toHaveBeenCalledWith('تم حذف التنبيه بنجاح.');
    expect(refetchAlerts).toHaveBeenCalled();
  });

  it('shows an error and does not refetch when delete fails', async () => {
    (alertsService.remove as jest.Mock).mockRejectedValue(new Error('boom'));
    const { result, refetchAlerts, triggerToast } = await setup();

    await act(() => result.current.handleDeleteAlert('a1'));
    await act(() => result.current.handleConfirmDeleteAlert());

    expect(showAlert).toHaveBeenCalledWith('خطأ', expect.any(String));
    expect(triggerToast).not.toHaveBeenCalled();
    expect(refetchAlerts).not.toHaveBeenCalled();
  });
});

import { act, renderHook } from '@testing-library/react-native';

import { AlertItem, alertsService } from '@/shared/api/alerts.service';
import { showAlert } from '@/shared/utils/alert';

import { useAlertActions } from '../useAlertActions';

jest.mock('@/shared/api/alerts.service', () => ({
  alertsService: { remove: jest.fn() },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const alerts = [{ id: 'a1' }, { id: 'a2' }] as AlertItem[];

async function setup() {
  const refetchAlerts = jest.fn();
  const triggerToast = jest.fn();
  const utils = await renderHook(() =>
    useAlertActions({ alerts, refetchAlerts, triggerToast }),
  );
  return { ...utils, refetchAlerts, triggerToast };
}

describe('useAlertActions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('toggles a single alert between active and paused', async () => {
    const { result } = await setup();
    expect(result.current.isAlertActive('a1')).toBe(true);

    await act(() => result.current.handleToggleAlertActive('a1'));
    expect(result.current.isAlertActive('a1')).toBe(false);
    expect(result.current.isAlertActive('a2')).toBe(true);
    expect(result.current.allAlertsPaused).toBe(false);

    await act(() => result.current.handleToggleAlertActive('a1'));
    expect(result.current.isAlertActive('a1')).toBe(true);
  });

  it('pauses all alerts, then resumes all once everything is paused', async () => {
    const { result } = await setup();

    await act(() => result.current.handleToggleAllAlerts());
    expect(result.current.allAlertsPaused).toBe(true);
    expect(result.current.isAlertActive('a2')).toBe(false);

    await act(() => result.current.handleToggleAllAlerts());
    expect(result.current.allAlertsPaused).toBe(false);
    expect(result.current.isAlertActive('a1')).toBe(true);
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

  it('does nothing on confirm when no alert was chosen', async () => {
    const { result } = await setup();
    await act(() => result.current.handleConfirmDeleteAlert());
    expect(alertsService.remove).not.toHaveBeenCalled();
  });
});

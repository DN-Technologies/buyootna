import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ReactNode } from 'react';

import apiClient from '@/shared/api/api';
import { ActivityItem } from '@/shared/hooks/useMyActivity';
import { showAlert } from '@/shared/utils/alert';

import { useAdActions } from '../useAdActions';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { patch: jest.fn(), delete: jest.fn() },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const mockDelete = apiClient.delete as jest.Mock;
const mockPatch = apiClient.patch as jest.Mock;

const ad = (id: string, isHidden = false) =>
  ({ id, status: 'ACTIVE', isHidden }) as ActivityItem;
const ADS = [ad('p1'), ad('p2'), ad('p3')];

// Matches the ['myActivity', status] query useMyActivity() caches
const cachedIds = (queryClient: QueryClient) =>
  queryClient
    .getQueryData<{ activity: ActivityItem[] }>(['myActivity', undefined])!
    .activity.map((p) => p.id);

const cachedActivity = (queryClient: QueryClient) =>
  queryClient.getQueryData<{ activity: ActivityItem[] }>([
    'myActivity',
    undefined,
  ])!.activity;

let queryClient: QueryClient;

async function setup(listedAds: ActivityItem[] = ADS) {
  // No garbage-collection timers left running after the test
  queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  queryClient.setQueryData(['myActivity', undefined], {
    activity: ADS,
    freeAdsRemaining: 0,
  });
  const refetch = jest.fn();
  const triggerToast = jest.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = await renderHook(
    () =>
      useAdActions({
        refetch,
        triggerToast,
        freeAdsRemaining: 1,
        listedAds,
      }),
    { wrapper },
  );
  // Sheets are refs to bottom sheets that aren't rendered here
  const present = jest.fn();
  (utils.result.current.deleteSheetRef as any).current = { present };
  (utils.result.current.deleteAllSheetRef as any).current = { present };
  (utils.result.current.toggleVisibilitySheetRef as any).current = { present };
  return { ...utils, queryClient, refetch, triggerToast, present };
}

describe('useAdActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    queryClient?.clear();
    jest.restoreAllMocks();
  });

  it('opens the dedicated Edit Ad screen, not the create flow', async () => {
    const { result } = await setup();

    await act(() => result.current.handleEditAd('prop-1'));

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/edit-listing/prop-1');
  });

  describe('deleting one ad (card ⋮ → حذف)', () => {
    it('deletes it on the server, removes it from the list at once and confirms', async () => {
      let resolveDelete!: () => void;
      mockDelete.mockReturnValue(
        new Promise<void>((r) => {
          resolveDelete = r;
        }),
      );
      const { result, queryClient, refetch, triggerToast } = await setup();

      await act(() => result.current.handleDeleteAd('p2'));
      let pending!: Promise<void>;
      await act(async () => {
        pending = result.current.handleConfirmDelete('SOLD');
      });

      // Gone from the list before the server has even answered
      expect(cachedIds(queryClient)).toEqual(['p1', 'p3']);
      expect(mockDelete).toHaveBeenCalledWith('/properties/p2', {
        data: { reason: 'SOLD' },
      });

      await act(async () => {
        resolveDelete();
        await pending;
      });
      expect(triggerToast).toHaveBeenCalledWith('تم حذف الاعلان بنجاح.');
      expect(refetch).toHaveBeenCalled();
      expect(showAlert).not.toHaveBeenCalled();
    });

    it('puts the ad back and explains when the server refuses', async () => {
      mockDelete.mockRejectedValue({
        response: { status: 403, data: { message: 'غير مصرح لك' } },
      });
      const { result, queryClient, triggerToast } = await setup();

      await act(() => result.current.handleDeleteAd('p2'));
      await act(() => result.current.handleConfirmDelete('SOLD'));

      expect(cachedIds(queryClient)).toEqual(['p1', 'p2', 'p3']);
      expect(showAlert).toHaveBeenCalledWith('خطأ', 'غير مصرح لك');
      expect(triggerToast).not.toHaveBeenCalled();
    });

    it('never closes silently without an ad to delete', async () => {
      const { result } = await setup();

      await act(() => result.current.handleConfirmDelete('SOLD'));

      expect(mockDelete).not.toHaveBeenCalled();
      expect(showAlert).toHaveBeenCalledWith(
        'خطأ',
        expect.stringContaining('تعذر'),
      );
    });
  });

  describe('header ⋮ → حذف جميع الإعلانات', () => {
    it('opens the options menu, not the single-ad delete sheet', async () => {
      const { result, present } = await setup();

      await act(() => result.current.handleMenuPress());

      expect(result.current.isOptionsMenuVisible).toBe(true);
      expect(present).not.toHaveBeenCalled();
    });

    it('deletes every listed ad and confirms', async () => {
      mockDelete.mockResolvedValue({});
      const { result, queryClient, refetch, triggerToast, present } =
        await setup([ad('p1'), ad('p3')]);

      await act(() => result.current.handleMenuPress());
      await act(() => result.current.handlePromptDeleteAll());
      expect(result.current.isOptionsMenuVisible).toBe(false);
      expect(present).toHaveBeenCalledTimes(1);

      await act(() => result.current.handleConfirmDeleteAll());

      expect(mockDelete.mock.calls.map((c) => c[0])).toEqual([
        '/properties/p1',
        '/properties/p3',
      ]);
      // Only the listed (filtered) ads go
      expect(cachedIds(queryClient)).toEqual(['p2']);
      expect(triggerToast).toHaveBeenCalledWith('تم حذف جميع الإعلانات بنجاح.');
      expect(refetch).toHaveBeenCalled();
    });

    it('reports partial failures instead of claiming success', async () => {
      mockDelete
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce({});
      const { result, refetch, triggerToast } = await setup();

      await act(() => result.current.handleConfirmDeleteAll());

      expect(triggerToast).not.toHaveBeenCalled();
      expect(showAlert).toHaveBeenCalledWith('خطأ', 'تعذر حذف 1 من 3 إعلانات');
      expect(refetch).toHaveBeenCalled();
    });

    it('does nothing when there are no ads listed', async () => {
      const { result, present } = await setup([]);

      await act(() => result.current.handlePromptDeleteAll());
      await act(() => result.current.handleConfirmDeleteAll());

      expect(present).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('header ⋮ → إخفاء / إظهار جميع الإعلانات', () => {
    it('calculates allHidden based on listedAds isHidden flags', async () => {
      const visibleAds = [ad('p1', false), ad('p2', false)];
      const { result: visibleResult } = await setup(visibleAds);
      expect(visibleResult.current.allHidden).toBe(false);

      const mixedAds = [ad('p1', true), ad('p2', false)];
      const { result: mixedResult } = await setup(mixedAds);
      expect(mixedResult.current.allHidden).toBe(false);

      const hiddenAds = [ad('p1', true), ad('p2', true)];
      const { result: hiddenResult } = await setup(hiddenAds);
      expect(hiddenResult.current.allHidden).toBe(true);
    });

    it('opens the toggle visibility sheet and closes options menu', async () => {
      const { result, present } = await setup();

      await act(() => result.current.handleMenuPress());
      await act(() => result.current.handlePromptToggleVisibility());

      expect(result.current.isOptionsMenuVisible).toBe(false);
      expect(present).toHaveBeenCalledTimes(1);
    });

    it('hides all ads when they are currently visible', async () => {
      mockPatch.mockResolvedValue({});
      const { result, queryClient, refetch, triggerToast } = await setup([
        ad('p1', false),
        ad('p2', false),
      ]);

      await act(() => result.current.handleConfirmToggleVisibility());

      expect(mockPatch).toHaveBeenCalledWith('/properties/p1', {
        isHidden: true,
      });
      expect(mockPatch).toHaveBeenCalledWith('/properties/p2', {
        isHidden: true,
      });
      expect(
        cachedActivity(queryClient)
          .slice(0, 2)
          .every((p) => p.isHidden === true),
      ).toBe(true);
      expect(triggerToast).toHaveBeenCalledWith(
        'تم إخفاء جميع الإعلانات بنجاح',
      );
      expect(refetch).toHaveBeenCalled();
    });

    it('shows all ads when they are currently hidden', async () => {
      mockPatch.mockResolvedValue({});
      const { result, queryClient, refetch, triggerToast } = await setup([
        ad('p1', true),
        ad('p2', true),
      ]);

      await act(() => result.current.handleConfirmToggleVisibility());

      expect(mockPatch).toHaveBeenCalledWith('/properties/p1', {
        isHidden: false,
      });
      expect(mockPatch).toHaveBeenCalledWith('/properties/p2', {
        isHidden: false,
      });
      expect(
        cachedActivity(queryClient)
          .slice(0, 2)
          .every((p) => p.isHidden === false),
      ).toBe(true);
      expect(triggerToast).toHaveBeenCalledWith(
        'تم إظهار جميع الإعلانات بنجاح',
      );
      expect(refetch).toHaveBeenCalled();
    });

    it('restores cache and alerts on failure', async () => {
      mockPatch
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Network error'));
      const { result, refetch, triggerToast } = await setup();

      await act(() => result.current.handleConfirmToggleVisibility());

      expect(triggerToast).not.toHaveBeenCalled();
      expect(showAlert).toHaveBeenCalledWith(
        'خطأ',
        'تعذر تحديث حالة 1 من 3 إعلانات',
      );
      expect(refetch).toHaveBeenCalled();
    });

    it('does nothing when no ads are listed', async () => {
      const { result, present } = await setup([]);

      await act(() => result.current.handlePromptToggleVisibility());
      await act(() => result.current.handleConfirmToggleVisibility());

      expect(present).not.toHaveBeenCalled();
      expect(mockPatch).not.toHaveBeenCalled();
    });
  });
});

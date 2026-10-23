import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { create } from 'zustand';

import { blocksService, type BlockTarget } from '@/shared/api/blocks.service';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useChatStore } from '@/shared/store/useChatStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

// Blocks belong to the account (all its profiles), so they're keyed by it
const blocksKey = (userId: string | null) => ['blocks', userId] as const;

const useAccountId = () => useAuthStore((s) => s.user?.id ?? null);

// Every query showing other accounts' ads or requests: a block (or unblock)
// takes their ads out of (or back into) all of them (Guideline 1.2)
const LISTING_QUERY_KEYS = [
  'homeProperties',
  'saleProperties',
  'rentProperties',
  'exchangeProperties',
  'userProperties',
  'property',
  'favorites',
  'searchResults',
  'mapDiscover',
  'serviceCompanies',
  'offices',
  'companyRequests',
] as const;

/**
 * Bumped after each block and unblock, for screens that keep what they
 * loaded in state rather than in a query (the home feed) to reload it.
 */
export const useBlocksVersion = create<{ version: number }>(() => ({
  version: 0,
}));

/** The accounts this account blocked. */
export function useBlockedAccounts() {
  const accountId = useAccountId();
  return useQuery({
    queryKey: blocksKey(accountId),
    queryFn: blocksService.list,
    enabled: !!accountId,
  });
}

/** Whether this account blocked that one (null while unknown). */
export function useBlockStatus(userId: string | null | undefined) {
  const accountId = useAccountId();
  const query = useQuery({
    queryKey: [...blocksKey(accountId), 'status', userId],
    queryFn: () => blocksService.status(userId ?? ''),
    enabled: !!accountId && !!userId && userId !== accountId,
  });
  return query.data ? query.data.blocked : null;
}

/**
 * Blocking and unblocking with their confirmations. After either, the
 * blocked list, the chat list, stories and every list of ads or requests
 * are refreshed so the change shows at once.
 */
export function useBlockFlow() {
  const accountId = useAccountId();
  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: blocksKey(accountId) });
    void queryClient.invalidateQueries({ queryKey: ['stories'] });
    for (const key of LISTING_QUERY_KEYS) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
    useBlocksVersion.setState((s) => ({ version: s.version + 1 }));
    void useChatStore.getState().loadConversations(1);
  }, [accountId, queryClient]);

  const askToBlock = useCallback(
    (
      target: BlockTarget,
      name: string,
      onBlocked?: () => void,
      onCancel?: () => void,
    ) => {
      showAlert(
        `حظر ${name}؟`,
        'لن يتمكن من مراسلتك، ولن ترى محادثاته أو قصصه أو تقييماته أو إعلاناته، وسيصلنا الحظر للمراجعة. يمكنك إلغاء الحظر من الإعدادات.',
        [
          { text: 'إلغاء', style: 'cancel', onPress: onCancel },
          {
            text: 'حظر',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  await blocksService.block(target);
                  refresh();
                  onBlocked?.();
                } catch (error) {
                  showAlert('خطأ', getApiErrorMessage(error, 'تعذر الحظر'));
                }
              })();
            },
          },
        ],
      );
    },
    [refresh],
  );

  const askToUnblock = useCallback(
    (userId: string, name: string, onUnblocked?: () => void) => {
      showAlert(
        `إلغاء حظر ${name}؟`,
        'سيتمكن من مراسلتك وسترى محتواه مجدداً.',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'إلغاء الحظر',
            onPress: () => {
              void (async () => {
                try {
                  await blocksService.unblock(userId);
                  refresh();
                  onUnblocked?.();
                } catch (error) {
                  showAlert('خطأ', getApiErrorMessage(error, 'تعذر إلغاء الحظر'));
                }
              })();
            },
          },
        ],
      );
    },
    [refresh],
  );

  return { askToBlock, askToUnblock };
}

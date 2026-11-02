import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { StoryViewQueue } from '../storyViewQueue';
import { storiesKeys, useActiveIdentityId } from './useStoriesQueries';

/**
 * The viewer's view queue, for the active profile only. Requests carry the
 * current token, so after a profile switch the old queue must not send:
 * it would credit the new profile. Leaving the viewer as the same profile
 * sends what's left; a switch drops it. The lists' rings refresh once it's
 * sent: returning to the list refetches them too soon to count these views.
 */
export function useStoryViewQueue(): StoryViewQueue {
  const identityId = useActiveIdentityId();
  const queryClient = useQueryClient();
  const queue = useMemo(
    () => new StoryViewQueue((ids) => storiesService.recordViews(ids)),
    // A new queue per profile
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [identityId],
  );
  useEffect(
    () => () => {
      const stillSameProfile =
        useAuthStore.getState().activeIdentity?.id === identityId;
      if (stillSameProfile) {
        void queue.flush().finally(() => {
          queue.dispose();
          void queryClient.invalidateQueries({
            queryKey: storiesKeys.rings(identityId),
          });
        });
      } else {
        queue.dispose();
      }
    },
    [identityId, queryClient, queue],
  );
  return queue;
}

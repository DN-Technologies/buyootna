import { useEffect, useMemo } from 'react';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import { StoryViewQueue } from '../storyViewQueue';
import { useActiveIdentityId } from './useStoriesQueries';

/**
 * The viewer's view queue, for the active profile only. Requests carry the
 * current token, so after a profile switch the old queue must not send:
 * it would credit the new profile. Leaving the viewer as the same profile
 * sends what's left; a switch drops it.
 */
export function useStoryViewQueue(): StoryViewQueue {
  const identityId = useActiveIdentityId();
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
        void queue.flush().finally(() => queue.dispose());
      } else {
        queue.dispose();
      }
    },
    [identityId, queue],
  );
  return queue;
}

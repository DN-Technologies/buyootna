import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useAuthorStories } from './useStoriesQueries';

/** What a provider's profile shows around its logo while it has stories. */
export interface ProviderStoryRing {
  hasUnseen: boolean;
  onPress: () => void;
}

/**
 * A company's or office's live stories for its profile header: a ring
 * (gold while any is unseen, grey after) that opens them. Null while there
 * are none, still loading, or for a profile id not known yet. Refreshes
 * whenever the screen comes into focus.
 */
export function useProviderStoryRing(
  identityId: string | null | undefined,
): ProviderStoryRing | null {
  const router = useRouter();
  const query = useAuthorStories(identityId ?? '', !!identityId);
  const { refetch } = query;

  useFocusEffect(
    useCallback(() => {
      if (identityId) void refetch();
    }, [identityId, refetch]),
  );

  const stories = query.data?.stories ?? [];
  if (!identityId || stories.length === 0) return null;
  return {
    hasUnseen: !!query.data?.hasUnseen,
    onPress: () =>
      router.push({
        pathname: '/stories/[authorId]',
        params: { authorId: identityId, source: 'author' },
      }),
  };
}

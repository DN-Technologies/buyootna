import { useFocusEffect } from '@react-navigation/native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import type { StoryRingSummary } from '../types';
import {
  providerStoriesHref,
  type ProviderStoryRing,
} from './useProviderStoryRing';
import { storiesKeys, useActiveIdentityId } from './useStoriesQueries';

// The API's limit per lookup (STORY_RINGS_MAX_IDS)
const IDS_PER_REQUEST = 50;

async function fetchRings(ids: string[]): Promise<StoryRingSummary[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += IDS_PER_REQUEST) {
    chunks.push(ids.slice(i, i + IDS_PER_REQUEST));
  }
  const pages = await Promise.all(chunks.map(storiesService.getRings));
  return pages.flat();
}

/**
 * The story rings for a list of companies or offices, in one lookup rather
 * than one per card. Null for a profile with no live stories, for guests
 * (stories need a login), and whenever the lookup fails: the list works
 * without rings. Refreshes whenever the screen comes into focus.
 */
export function useStoryRings(
  ids: string[],
): (id: string) => ProviderStoryRing | null {
  const router = useRouter();
  const identityId = useActiveIdentityId();
  const token = useAuthStore((s) => s.token);
  // Same ids in any order or repeated are the same lookup
  const uniqueIds = useMemo(() => [...new Set(ids)].sort(), [ids]);
  const enabled = !!token && !!identityId && uniqueIds.length > 0;

  const { data, refetch } = useQuery({
    queryKey: storiesKeys.rings(identityId, uniqueIds),
    queryFn: () => fetchRings(uniqueIds),
    enabled,
    retry: false,
    // Loading another page keeps the rings already on screen
    placeholderData: keepPreviousData,
  });

  useFocusEffect(
    useCallback(() => {
      if (enabled) void refetch();
    }, [enabled, refetch]),
  );

  const byId = useMemo(
    () => new Map((data ?? []).map((ring) => [ring.identityId, ring])),
    [data],
  );

  return useCallback(
    (id: string) => {
      const ring = enabled ? byId.get(id) : undefined;
      if (!ring) return null;
      return {
        hasUnseen: ring.hasUnseen,
        partial: ring.partial,
        onPress: () => router.push(providerStoriesHref(id)),
      };
    },
    [byId, enabled, router],
  );
}

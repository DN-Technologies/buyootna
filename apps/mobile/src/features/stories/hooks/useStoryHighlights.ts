import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import type { StoryHighlightInput } from '../types';
import { storiesKeys, useActiveIdentityId } from './useStoriesQueries';

export const highlightKeys = {
  archive: (identityId: string | null) =>
    [...storiesKeys.all(identityId), 'archive'] as const,
  mine: (identityId: string | null) =>
    [...storiesKeys.all(identityId), 'highlights', 'mine'] as const,
  author: (identityId: string | null, authorId: string) =>
    [...storiesKeys.all(identityId), 'highlights', authorId] as const,
};

/** The current profile's stories of the last 30 days, paged. */
export function useStoryArchive(enabled = true) {
  const identityId = useActiveIdentityId();
  const token = useAuthStore((s) => s.token);
  const query = useInfiniteQuery({
    queryKey: highlightKeys.archive(identityId),
    queryFn: ({ pageParam }) => storiesService.getArchive(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: enabled && !!token && !!identityId,
  });
  return {
    ...query,
    stories: query.data?.pages.flatMap((p) => p.stories) ?? [],
  };
}

/** The current profile's highlights (companies and offices). */
export function useMyHighlights(enabled = true) {
  const identityId = useActiveIdentityId();
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: highlightKeys.mine(identityId),
    queryFn: () => storiesService.getMyHighlights(),
    enabled: enabled && !!token && !!identityId,
  });
}

/** A company's or office's highlights, as on its profile. */
export function useAuthorHighlights(authorId: string | undefined) {
  const identityId = useActiveIdentityId();
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: highlightKeys.author(identityId, authorId ?? ''),
    queryFn: () => storiesService.getAuthorHighlights(authorId ?? ''),
    enabled: !!authorId && !!token && !!identityId,
  });
}

/** Creating, editing, deleting and ordering highlights; each refreshes them. */
export function useHighlightMutations() {
  const identityId = useActiveIdentityId();
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: [...storiesKeys.all(identityId), 'highlights'],
    });

  const create = useMutation({
    mutationFn: (input: { title: string; storyIds: string[] }) =>
      storiesService.createHighlight(input),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: StoryHighlightInput }) =>
      storiesService.updateHighlight(id, input),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => storiesService.removeHighlight(id),
    onSuccess: refresh,
  });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => storiesService.reorderHighlights(ids),
    onSuccess: refresh,
  });
  return { create, update, remove, reorder };
}

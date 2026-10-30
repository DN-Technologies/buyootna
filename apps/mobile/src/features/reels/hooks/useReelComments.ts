import { useCallback, useEffect, useRef, useState } from 'react';

import { reelsService } from '@/shared/api/reels.service';

import type { ReelComment } from '../types';

/**
 * One reel's comments while its sheet is open: newest first, more as you
 * scroll, your new one on top at once. Starts again for another reel.
 */
export function useReelComments(reelId: string | null) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const cursor = useRef<string | null>(null);
  const busy = useRef(false);
  // An answer about the reel before this one is dropped
  const current = useRef(reelId);
  current.current = reelId;

  const start = useCallback(async (id: string) => {
    setLoading(true);
    setFailed(false);
    setComments([]);
    cursor.current = null;
    try {
      const page = await reelsService.getComments(id);
      if (current.current !== id) return;
      setComments(page.comments);
      cursor.current = page.nextCursor;
    } catch {
      if (current.current === id) setFailed(true);
    } finally {
      if (current.current === id) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reelId) void start(reelId);
  }, [reelId, start]);

  const loadMore = useCallback(async () => {
    if (!reelId || !cursor.current || busy.current) return;
    busy.current = true;
    try {
      const page = await reelsService.getComments(reelId, cursor.current);
      if (current.current !== reelId) return;
      cursor.current = page.nextCursor;
      const known = new Set(comments.map((c) => c.id));
      setComments((all) => [
        ...all,
        ...page.comments.filter((c) => !known.has(c.id)),
      ]);
    } catch {
      // Tried again on the next scroll to the end
    } finally {
      busy.current = false;
    }
  }, [comments, reelId]);

  const add = useCallback(
    async (body: string) => {
      if (!reelId) return null;
      const comment = await reelsService.addComment(reelId, body);
      setComments((all) => [comment, ...all]);
      return comment;
    },
    [reelId],
  );

  const remove = useCallback(async (commentId: string) => {
    await reelsService.removeComment(commentId);
    setComments((all) => all.filter((c) => c.id !== commentId));
  }, []);

  const dropAuthor = useCallback((identityId: string) => {
    setComments((all) => all.filter((c) => c.author.identityId !== identityId));
  }, []);

  return {
    comments,
    loading,
    failed,
    retry: () => (reelId ? start(reelId) : Promise.resolve()),
    loadMore,
    add,
    remove,
    dropAuthor,
  };
}

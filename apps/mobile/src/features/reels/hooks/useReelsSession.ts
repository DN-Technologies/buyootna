import { useCallback, useEffect, useRef, useState } from 'react';

import { reelsService } from '@/shared/api/reels.service';

import { mergeReels } from '../reelRules';
import type { ReelFilters, ReelPage, ViewerReel } from '../types';

// Pages in a row that may add nothing (all already shown) before giving up
const MAX_EMPTY_PAGES = 5;

const errorCode = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

/**
 * What one sitting in the viewer shows. It only ever grows at the end, so
 * what's on screen doesn't move: a refetch would shift the list under the
 * video playing. Kept here rather than in a query for that reason. A cursor
 * that expired (6 hours) starts the feed again and drops what's already
 * shown; `startId` opens at that reel, wherever it came from.
 */
export function useReelsSession({
  authorId,
  startId,
  filters,
}: {
  authorId?: string;
  startId?: string;
  // The main feed only
  filters?: ReelFilters;
}) {
  const [items, setItems] = useState<ViewerReel[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const cursor = useRef<string | undefined>(undefined);
  const finished = useRef(false);
  const busy = useRef(false);
  // Bumped when the list starts again: an answer to an older request is dropped
  const generation = useRef(0);
  const shown = useRef<ViewerReel[]>([]);

  const replace = useCallback((next: ViewerReel[]) => {
    shown.current = next;
    setItems(next);
  }, []);

  const fetchPage = useCallback(
    (at?: string): Promise<ReelPage> =>
      authorId
        ? reelsService.getByAuthor(authorId, at)
        : reelsService.getFeed(at, undefined, filters),
    [authorId, filters],
  );

  const loadMore = useCallback(async () => {
    if (busy.current || finished.current) return;
    busy.current = true;
    const mine = generation.current;
    try {
      for (let tries = 0; tries < MAX_EMPTY_PAGES; tries += 1) {
        let page: ReelPage;
        try {
          page = await fetchPage(cursor.current);
        } catch (error) {
          if (errorCode(error) !== 'REEL_CURSOR_EXPIRED') throw error;
          cursor.current = undefined;
          page = await fetchPage();
        }
        if (mine !== generation.current) return;
        cursor.current = page.nextCursor ?? undefined;
        finished.current = !page.nextCursor;
        const next = mergeReels(shown.current, page.reels);
        const added = next.length > shown.current.length;
        replace(next);
        if (added || finished.current) break;
      }
    } finally {
      if (mine === generation.current) busy.current = false;
    }
  }, [fetchPage, replace]);

  const start = useCallback(async () => {
    generation.current += 1;
    const mine = generation.current;
    busy.current = false;
    setLoading(true);
    setFailed(false);
    setStartIndex(0);
    cursor.current = undefined;
    finished.current = false;
    replace([]);
    try {
      await loadMore();
      if (startId) {
        let index = shown.current.findIndex((r) => r.id === startId);
        if (index === -1) {
          // A link, or further down than the first page: put it first. Gone
          // or hidden, the feed simply opens at its start
          const reel = await reelsService.getOne(startId).catch(() => null);
          if (reel) replace(mergeReels([reel], shown.current));
          index = 0;
        }
        setStartIndex(index);
      }
    } catch {
      if (mine === generation.current) setFailed(true);
    } finally {
      if (mine === generation.current) setLoading(false);
    }
  }, [loadMore, replace, startId]);

  useEffect(() => {
    void start();
  }, [start]);

  /** A like on its way, or its answer. */
  const update = useCallback(
    (id: string, patch: Partial<ViewerReel>) => {
      replace(shown.current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [replace],
  );

  /** A reel deleted, or everything by an account just blocked. */
  const removeWhere = useCallback(
    (shouldRemove: (reel: ViewerReel) => boolean) => {
      replace(shown.current.filter((r) => !shouldRemove(r)));
    },
    [replace],
  );

  return {
    items,
    startIndex,
    loading,
    failed,
    retry: start,
    loadMore,
    update,
    removeWhere,
  };
}

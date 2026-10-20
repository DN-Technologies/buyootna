import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, I18nManager } from 'react-native';

import {
  nextAuthor,
  nextStory,
  previousAuthor,
  previousStory,
  type StoryPosition,
  type StoryStep,
  swipeAction,
  tapAction,
  type TapSide,
} from '../storyNavigation';
import {
  STORY_IMAGE_MS,
  STORY_LINK_MARGIN_MS,
  STORY_VIDEO_FALLBACK_MS,
  STORY_VIEW_AFTER_MS,
} from '../storyViewerConstants';
import type { StoryAuthorStories } from '../types';
import { useActiveIdentityId, useMarkStoryViewed } from './useStoriesQueries';
import { useStoryTimer } from './useStoryTimer';
import { useStoryViewQueue } from './useStoryViewQueue';

const firstUnseen = (a: StoryAuthorStories | undefined) => {
  const i = a ? a.stories.findIndex((s) => !s.viewed) : -1;
  return i === -1 ? 0 : i;
};

/**
 * Which story is on screen and its clock: opens at the chosen author's
 * first unseen story, moves on when the clock ends, follows taps and
 * swipes, records a view after a second (never the author's own), preloads
 * the next photos in memory, and renews links that are about to expire.
 * The clock runs only while the media is ready, the screen is focused and
 * the app active, and nothing pauses it.
 */
export function useStoryPlayback({
  authorId,
  authors,
  counts,
  loading,
  fetched,
  refetch,
  isMine,
  paused,
  close,
}: {
  authorId: string;
  authors: StoryAuthorStories[];
  counts: number[];
  loading: boolean;
  fetched: boolean;
  refetch: () => void;
  isMine: boolean;
  // Held, a sheet open, or a reply on its way
  paused: boolean;
  close: () => void;
}) {
  const isFocused = useIsFocused();
  const identityId = useActiveIdentityId();
  const openedAs = useRef(identityId);
  const queue = useStoryViewQueue();
  const markViewed = useMarkStoryViewed();

  const [position, setPosition] = useState<StoryPosition | null>(null);
  const [restart, setRestart] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retried, setRetried] = useState(false);
  // At an iOS cold start (and in tests) the state can be 'unknown': start
  // running unless backgrounded; the listener then pauses on anything but
  // 'active' (Control Center, the app switcher)
  const [appActive, setAppActive] = useState(
    AppState.currentState !== 'background' &&
      AppState.currentState !== 'inactive',
  );

  // Open at the chosen author's first unseen story
  useEffect(() => {
    if (position || authors.length === 0) return;
    const authorIndex = Math.max(
      0,
      authors.findIndex((a) => a.author.identityId === authorId),
    );
    const author = authors[authorIndex];
    setPosition({
      authorIndex,
      storyIndex: Math.min(author.firstUnseenIndex, author.stories.length - 1),
    });
  }, [authors, authorId, position]);

  // Nothing to show (none left, or not signed in): close
  useEffect(() => {
    if (!loading && authors.length === 0 && (fetched || !identityId)) {
      close();
    }
  }, [authors.length, close, identityId, fetched, loading]);

  // Another profile: its stories and seen state are not this one's
  useEffect(() => {
    if (identityId !== openedAs.current) close();
  }, [identityId, close]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) =>
      setAppActive(state === 'active'),
    );
    return () => sub.remove();
  }, []);

  const current =
    position && authors[position.authorIndex]
      ? authors[position.authorIndex].stories[position.storyIndex]
      : undefined;
  const author = position ? authors[position.authorIndex] : undefined;

  const go = useCallback(
    (step: StoryStep) => {
      if (step.kind === 'close') {
        close();
        return;
      }
      setPosition((at) => {
        if (
          at &&
          at.authorIndex === step.position.authorIndex &&
          at.storyIndex === step.position.storyIndex
        ) {
          setRestart((n) => n + 1);
        }
        return step.position;
      });
    },
    [close],
  );

  // A list that shrank (a story expired or was deleted): stay in range
  useEffect(() => {
    if (!position || authors.length === 0) return;
    if (!authors[position.authorIndex]) {
      setPosition({ authorIndex: authors.length - 1, storyIndex: 0 });
    } else if (!authors[position.authorIndex].stories[position.storyIndex]) {
      setPosition({ authorIndex: position.authorIndex, storyIndex: 0 });
    }
  }, [authors, position]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setRetried(false);
  }, [current?.id]);

  const running = !!current && loaded && isFocused && appActive && !paused;

  const isVideo = current?.mediaType === 'VIDEO';
  const progress = useStoryTimer({
    // A video's clock is its measured length, and only runs while it plays
    durationMs: isVideo
      ? (current?.durationMs ?? STORY_VIDEO_FALLBACK_MS)
      : STORY_IMAGE_MS,
    running,
    resetKey: `${current?.id ?? ''}:${restart}`,
    onDone: () => position && go(nextStory(position, counts)),
  });

  // Counts as viewed after a second on screen (a video: a second played)
  const watching = isVideo ? running : loaded;
  useEffect(() => {
    if (isMine || !current || !watching || current.viewed) return undefined;
    const id = current.id;
    const timer = setTimeout(() => {
      queue.add(id);
      markViewed(id);
    }, STORY_VIEW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [isMine, current, watching, queue, markViewed]);

  // The next photos (a video's poster), in memory only
  useEffect(() => {
    if (!position) return;
    const upcoming = [
      authors[position.authorIndex]?.stories[position.storyIndex + 1],
      authors[position.authorIndex + 1]?.stories[firstUnseen(authors[position.authorIndex + 1])],
    ].flatMap((s) => {
      if (!s) return [];
      if (s.mediaType !== 'VIDEO') return [s.mediaUrl];
      return s.posterUrl ? [s.posterUrl] : [];
    });
    if (upcoming.length) void Image.prefetch(upcoming, 'memory');
  }, [authors, position]);

  // Opened after the screen sat idle: links about to expire are renewed
  // up front (once per story), rather than failing to load first
  const renewedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!current || renewedFor.current === current.id) return;
    if (Date.parse(current.urlExpiresAt) - Date.now() > STORY_LINK_MARGIN_MS) return;
    renewedFor.current = current.id;
    refetch();
  }, [current, refetch]);

  // A link that expired (or a story gone): fetch fresh links once
  const onMediaError = () => {
    if (retried) {
      setFailed(true);
      return;
    }
    setRetried(true);
    refetch();
  };

  const startAt = (i: number) => firstUnseen(authors[i]);

  const onTap = (side: TapSide) => {
    if (!position) return;
    go(
      tapAction(side, I18nManager.isRTL) === 'next'
        ? nextStory(position, counts)
        : previousStory(position, counts),
    );
  };

  const onSwipe = (dx: number, dy: number) => {
    if (!position) return;
    const action = swipeAction(dx, dy, I18nManager.isRTL);
    if (action === 'close') close();
    else if (action === 'nextAuthor') go(nextAuthor(position, counts, startAt));
    else if (action === 'previousAuthor') go(previousAuthor(position, startAt));
  };

  return {
    position,
    current,
    author,
    restart,
    loaded,
    failed,
    running,
    progress,
    onMediaReady: () => setLoaded(true),
    onMediaWaiting: () => setLoaded(false),
    onMediaError,
    onTap,
    onSwipe,
  };
}

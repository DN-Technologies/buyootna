/**
 * Moving through stories: within an author, then to the next / previous
 * author. Pure, so the viewer's behaviour is tested without gestures.
 */
export interface StoryPosition {
  authorIndex: number;
  storyIndex: number;
}

export type StoryStep =
  | { kind: 'move'; position: StoryPosition }
  // Past the last story, or back from the very first one
  | { kind: 'close' };

/** How many stories each author has, in feed order. */
export type StoryCounts = number[];

export function nextStory(
  at: StoryPosition,
  counts: StoryCounts,
): StoryStep {
  if (at.storyIndex + 1 < (counts[at.authorIndex] ?? 0)) {
    return { kind: 'move', position: { ...at, storyIndex: at.storyIndex + 1 } };
  }
  return nextAuthor(at, counts);
}

export function previousStory(
  at: StoryPosition,
  counts: StoryCounts,
): StoryStep {
  if (at.storyIndex > 0) {
    return { kind: 'move', position: { ...at, storyIndex: at.storyIndex - 1 } };
  }
  if (at.authorIndex === 0) {
    // Instagram restarts the first story rather than closing
    return { kind: 'move', position: at };
  }
  const authorIndex = at.authorIndex - 1;
  return {
    kind: 'move',
    position: { authorIndex, storyIndex: Math.max(0, (counts[authorIndex] ?? 1) - 1) },
  };
}

/** The next author, opened at `startAt(authorIndex)` (its first unseen). */
export function nextAuthor(
  at: StoryPosition,
  counts: StoryCounts,
  startAt: (authorIndex: number) => number = () => 0,
): StoryStep {
  const authorIndex = at.authorIndex + 1;
  if (authorIndex >= counts.length) return { kind: 'close' };
  return { kind: 'move', position: { authorIndex, storyIndex: startAt(authorIndex) } };
}

export function previousAuthor(
  at: StoryPosition,
  startAt: (authorIndex: number) => number = () => 0,
): StoryStep {
  if (at.authorIndex === 0) return { kind: 'close' };
  const authorIndex = at.authorIndex - 1;
  return { kind: 'move', position: { authorIndex, storyIndex: startAt(authorIndex) } };
}

export type TapSide = 'left' | 'right';

/**
 * A tap on one side of the screen. In the app's forced RTL the reading
 * direction runs right to left, so the left side goes forward (Instagram's
 * Arabic layout); in LTR it is the other way round.
 */
export function tapAction(side: TapSide, isRTL: boolean): 'next' | 'previous' {
  const forward: TapSide = isRTL ? 'left' : 'right';
  return side === forward ? 'next' : 'previous';
}

export type SwipeAction = 'nextAuthor' | 'previousAuthor' | 'close' | null;

const SWIPE_MIN = 60;

/**
 * A finished swipe. Down closes. Sideways moves between authors: the next
 * author lies in the reading direction, so in RTL a finger moving right
 * brings it in.
 */
export function swipeAction(dx: number, dy: number, isRTL: boolean): SwipeAction {
  if (dy > SWIPE_MIN * 1.5 && Math.abs(dy) > Math.abs(dx)) return 'close';
  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return null;
  const towardNext = isRTL ? dx > 0 : dx < 0;
  return towardNext ? 'nextAuthor' : 'previousAuthor';
}

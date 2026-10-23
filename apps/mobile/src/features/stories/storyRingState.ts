import type { StoryAuthorStories } from './types';

/**
 * Whether an author's ring is unseen (nothing watched), partial (some
 * watched, new ones left) or seen (all watched).
 */
export function isPartlyWatched(
  author: Pick<StoryAuthorStories, 'hasUnseen' | 'stories'>,
): boolean {
  return author.hasUnseen && author.stories.some((s) => s.viewed);
}

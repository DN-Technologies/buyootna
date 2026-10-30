/**
 * Reorders one page so the same author doesn't play twice in a row where that
 * can be avoided, keeping the order otherwise (each place takes the earliest
 * reel by another author). `lastAuthorId` is who played just before this page.
 * Only the page moves: the cursor still follows the feed's own order.
 */
export function spreadAuthors<T extends { identityId: string }>(
  page: T[],
  lastAuthorId?: string,
): T[] {
  const left = [...page];
  const result: T[] = [];
  let previous = lastAuthorId;
  while (left.length > 0) {
    const index = left.findIndex((reel) => reel.identityId !== previous);
    // Only this author is left
    const [next] = left.splice(index === -1 ? 0 : index, 1);
    result.push(next);
    previous = next.identityId;
  }
  return result;
}

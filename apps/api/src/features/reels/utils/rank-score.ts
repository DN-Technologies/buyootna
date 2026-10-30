const DAY_MS = 24 * 60 * 60 * 1000;

// A reel starts as if it already had this many views at an average rate, so a
// few early views can't swing it to an extreme
const COMPLETION_PRIOR = { rate: 0.3, weight: 10 };
const LIKE_PRIOR = { rate: 0.05, weight: 20 };
// A like says more than watching to the end
const LIKE_WEIGHT = 2;
// Freshness falls to about 37% after this many days
const FRESHNESS_DAYS = 7;

export interface ReelRankStats {
  views: number;
  completed: number;
  likes: number;
  publishedAt: Date;
}

/**
 * Quality × freshness. Quality is the completion rate plus the like rate, both
 * smoothed. With no views yet it is the average, so a new reel gets a fair
 * start and, being fresh, usually sits above older ones of the same quality.
 */
export function reelRankScore(stats: ReelRankStats, now: Date): number {
  const completion =
    (stats.completed + COMPLETION_PRIOR.rate * COMPLETION_PRIOR.weight) /
    (stats.views + COMPLETION_PRIOR.weight);
  const likes =
    (stats.likes + LIKE_PRIOR.rate * LIKE_PRIOR.weight) /
    (stats.views + LIKE_PRIOR.weight);
  const quality = completion + LIKE_WEIGHT * likes;
  const ageDays = Math.max(
    0,
    (now.getTime() - stats.publishedAt.getTime()) / DAY_MS,
  );
  return quality * Math.exp(-ageDays / FRESHNESS_DAYS);
}

import { formatTimeAgo } from '@/shared/utils/helpers/time';

// Real activity / response-speed signals from the API (IdentityStatsService)
export interface IdentityPresence {
  isOnline: boolean;
  lastSeenAt: string | null;
}

export interface ResponseTime {
  medianSeconds: number;
  sampleSize: number;
}

// Past this, "last seen" says nothing useful, so the badge is hidden
const LAST_SEEN_MAX_DAYS = 7;

/**
 * The activity badge: "نشط الآن" while the app is open, "نشط منذ X" for up
 * to a week, then nothing (so a quiet account doesn't look abandoned).
 */
export function formatPresence(
  presence?: IdentityPresence | null,
): { label: string; isOnline: boolean } | null {
  if (!presence) return null;
  if (presence.isOnline) return { label: 'نشط الآن', isOnline: true };
  if (!presence.lastSeenAt) return null;

  const seenAt = new Date(presence.lastSeenAt).getTime();
  if (Number.isNaN(seenAt)) return null;
  if (Date.now() - seenAt > LAST_SEEN_MAX_DAYS * 24 * 60 * 60 * 1000) {
    return null;
  }
  // formatTimeAgo -> "منذ 3 ساعة"; under a minute it says "الآن"
  const ago = formatTimeAgo(presence.lastSeenAt);
  return { label: ago === 'الآن' ? 'نشط الآن' : `نشط ${ago}`, isOnline: false };
}

/** Median reply time as a stable bucket, or null when there's too little data. */
export function formatResponseTime(rt?: ResponseTime | null): string | null {
  if (!rt) return null;
  const minutes = rt.medianSeconds / 60;
  if (minutes < 15) return 'خلال دقائق';
  if (minutes < 60) return 'خلال ساعة';
  if (minutes < 6 * 60) return 'خلال ساعات';
  if (minutes < 24 * 60) return 'خلال يوم';
  return 'أكثر من يوم';
}

import { useQuery } from '@tanstack/react-query';

import { plansService, type PublishOption } from '@/shared/api/plans.service';
import type { AdLevel } from '@/shared/store/useListingStore';

// The packages' limits when the user's options aren't known (or none of
// that level): الاساسية 5 photos, الذهبية 15
export const DEFAULT_IMAGE_LIMITS: Record<AdLevel, number> = {
  normal: 5,
  premium: 15,
};

/**
 * How many photos an ad of this level may carry: the most any of the
 * user's packages of that level allows (a featured ad publishes from a
 * package with featured days, a normal one from the others or the free
 * ad). The server refuses more than the package allows.
 */
export function imageLimitFor(
  level: AdLevel,
  options: PublishOption[] | undefined,
): number {
  const ofLevel = (options ?? []).filter((option) =>
    level === 'premium' ? option.featuredDays > 0 : option.featuredDays === 0,
  );
  if (ofLevel.length === 0) return DEFAULT_IMAGE_LIMITS[level];
  return Math.max(...ofLevel.map((option) => option.maxImagesPerAd));
}

export function useAdImageLimit(level: AdLevel): number {
  const { data } = useQuery({
    queryKey: ['publishOptions'],
    queryFn: () => plansService.getPublishOptions(),
    staleTime: 0,
  });
  return imageLimitFor(level, data?.options);
}

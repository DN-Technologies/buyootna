import { useQuery } from '@tanstack/react-query';

import { plansService } from '@/shared/api/plans.service';

/**
 * How many ads the user's packages can still publish, split by level: a
 * package with featured days publishes featured ads, the rest normal ones.
 * The free ad isn't a package; the form's banner covers it.
 */
export function useAdBalance() {
  const { data } = useQuery({
    queryKey: ['publishOptions'],
    queryFn: () => plansService.getPublishOptions(),
    staleTime: 0,
  });

  const packages = (data?.options ?? []).filter(
    (option) => option.type === 'PLAN_SLOT',
  );
  const sum = (featured: boolean) =>
    packages
      .filter((option) => option.featuredDays > 0 === featured)
      .reduce((total, option) => total + option.adsRemaining, 0);

  return {
    hasPackages: packages.length > 0,
    normalCount: sum(false),
    featuredCount: sum(true),
  };
}

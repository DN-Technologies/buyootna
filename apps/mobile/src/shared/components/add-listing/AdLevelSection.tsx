import AdLevelSelector from '@/shared/components/add-listing/AdLevelSelector';
import { useAdBalance } from '@/shared/hooks/properties/useAdBalance';
import { useListingStore } from '@/shared/store/useListingStore';

/**
 * The normal/featured choice, shown once the user has package ads. With only
 * the free ad there is nothing to choose: it publishes as a normal ad.
 */
export default function AdLevelSection() {
  const adLevel = useListingStore((s) => s.adLevel);
  const updateField = useListingStore((s) => s.updateField);
  const { hasPackages, normalCount, featuredCount } = useAdBalance();

  if (!hasPackages) return null;

  return (
    <AdLevelSelector
      value={adLevel}
      onChange={(level) => updateField('adLevel', level)}
      normalCount={normalCount}
      featuredCount={featuredCount}
    />
  );
}

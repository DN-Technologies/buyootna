import { Text } from 'react-native';

import AdLevelSelector from '@/shared/components/add-listing/AdLevelSelector';
import { useAdLevelChoice } from '@/shared/hooks/properties/useAdLevelChoice';
import { useListingStore } from '@/shared/store/useListingStore';

export const AD_LEVEL_REQUIRED_MESSAGE = 'يرجى اختيار نوع الإعلان';

/**
 * The normal/featured choice, shown once the user has package ads. With only
 * the free ad there is nothing to choose: it publishes as a normal ad. A new
 * ad must pick one (QA), and a level with nothing left can't be picked.
 */
export default function AdLevelSection() {
  const adLevel = useListingStore((s) => s.adLevel);
  const adLevelChosen = useListingStore((s) => s.adLevelChosen);
  const updateField = useListingStore((s) => s.updateField);
  const choice = useAdLevelChoice();

  if (!choice.shown) return null;

  return (
    <>
      <AdLevelSelector
        value={adLevelChosen ? adLevel : null}
        onChange={(level) => {
          updateField('adLevel', level);
          updateField('adLevelChosen', true);
        }}
        normalCount={choice.normalCount}
        featuredCount={choice.featuredCount}
        normalDisabled={!choice.normalAvailable}
        featuredDisabled={!choice.featuredAvailable}
      />
      {choice.required && !adLevelChosen && (
        <Text
          testID="ad-level-required"
          className="-mt-2 font-cairo text-xs text-[#DC2626]"
          style={{ writingDirection: 'rtl' }}
        >
          {AD_LEVEL_REQUIRED_MESSAGE}
        </Text>
      )}
    </>
  );
}

import { Text, TouchableOpacity, View } from 'react-native';

import FadeHighlight from '@/shared/components/ui/FadeHighlight';

type PrimaryTab = 'all' | 'properties' | 'offices';
type PropertyFilter = 'all' | 'exchange' | 'rent' | 'sale';

interface HomeFilterPillsProps {
  activeTab: PrimaryTab;
  activePropFilter: PropertyFilter;
  onPropFilterChange: (filter: PropertyFilter) => void;
}

// In reading order: «بيع» on the right
const PROPERTY_FILTERS: { id: PropertyFilter; label: string }[] = [
  { id: 'sale', label: 'بيع' },
  { id: 'rent', label: 'إيجار' },
  { id: 'exchange', label: 'بدل' },
];

/**
 * «بيع / إيجار / بدل» under عقارات (Figma Component 22): the selected one
 * white with a gold border, the others grey. Hidden on the other tabs.
 */
export default function HomeFilterPills({
  activeTab,
  activePropFilter,
  onPropFilterChange,
}: HomeFilterPillsProps) {
  if (activeTab !== 'properties') return null;

  return (
    <View className="flex-row px-[16px]" style={{ gap: 10 }}>
      {PROPERTY_FILTERS.map((filter) => {
        const isActive = activePropFilter === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            testID={`home-filter-${filter.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.8}
            onPress={() => onPropFilterChange(filter.id)}
            className="h-[32px] w-[76px] items-center justify-center rounded-[16px] bg-[#F5F7F9]"
          >
            {/* White with a gold border, faded in over the grey */}
            <FadeHighlight
              active={isActive}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 0.5,
                borderColor: '#C5A36D',
                borderRadius: 16,
              }}
            />
            {/* Android cut the last letter ('إيجار' showed as 'ايجا', QA):
                its default measuring under-sizes Cairo's last glyph. The
                simple strategy, one line and a hair of side room fix it */}
            <Text
              testID={`home-filter-label-${filter.id}`}
              numberOfLines={1}
              textBreakStrategy="simple"
              className={`${
                isActive ? 'font-cairo-bold' : 'font-cairo'
              } px-0.5 text-[14px] leading-[22px] text-[#111111]`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

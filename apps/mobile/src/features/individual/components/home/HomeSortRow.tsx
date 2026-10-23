import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import FadeHighlight from '@/shared/components/ui/FadeHighlight';
import SlidingSegment from '@/shared/components/ui/SlidingSegment';

type ViewMode = 'card' | 'list';

interface HomeSortRowProps {
  onSortPress: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEWS: { id: ViewMode; label: string; icon: number }[] = [
  // In reading order: the list on the right
  {
    id: 'list',
    label: 'عرض سريع',
    icon: require('@/assets/icons/home/topbar/view-list.svg'),
  },
  {
    id: 'card',
    label: 'عرض بالصور',
    icon: require('@/assets/icons/home/topbar/view-photos.svg'),
  },
];

/**
 * Above the عقارات list (Figma Component 3): «الترتيب حسب» on the right, the
 * list / photos toggle on the left.
 */
export default function HomeSortRow({
  onSortPress,
  viewMode,
  onViewModeChange,
}: HomeSortRowProps) {
  return (
    <View className="mb-[8px] h-[32px] flex-row items-center justify-between">
      <TouchableOpacity
        testID="home-sort-button"
        accessibilityRole="button"
        accessibilityLabel="الترتيب حسب"
        activeOpacity={0.7}
        onPress={onSortPress}
        className="flex-row items-center py-[4px]"
        style={{ gap: 4 }}
      >
        <Image
          source={require('@/assets/icons/home/topbar/sort.svg')}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />
        <Text className="font-cairo-medium text-[14px] leading-[22px] text-[#111111]">
          الترتيب حسب
        </Text>
      </TouchableOpacity>

      {/* The navy selection slides over, iOS-style; the icons cross-fade
          between black and white */}
      <SlidingSegment
        options={VIEWS.map((v) => v.id)}
        value={viewMode}
        className="h-[30px] items-center rounded-[16px] bg-[#F9FAFE]"
        style={{ gap: 2 }}
        thumbStyle={{ backgroundColor: '#15304D', borderRadius: 16 }}
        renderOption={(id, active) => {
          const v = VIEWS.find((view) => view.id === id)!;
          return (
            <TouchableOpacity
              testID={`home-view-${v.id}`}
              accessibilityRole="tab"
              accessibilityLabel={v.label}
              accessibilityState={{ selected: active }}
              activeOpacity={0.8}
              onPress={() => onViewModeChange(v.id)}
              className="h-[30px] w-[40px] items-center justify-center"
            >
              <FadeHighlight active={!active}>
                <Image
                  source={v.icon}
                  style={{ width: 18, height: 18 }}
                  contentFit="contain"
                  tintColor="#111111"
                />
              </FadeHighlight>
              <FadeHighlight active={active}>
                <Image
                  source={v.icon}
                  style={{ width: 18, height: 18 }}
                  contentFit="contain"
                  tintColor="#FFFFFF"
                />
              </FadeHighlight>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

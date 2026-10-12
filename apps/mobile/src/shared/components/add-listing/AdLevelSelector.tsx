import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { AdLevel } from '@/shared/store/useListingStore';

interface AdLevelSelectorProps {
  value: AdLevel;
  onChange: (level: AdLevel) => void;
  // Ads left to publish at each level, from the user's packages
  normalCount: number;
  featuredCount: number;
}

interface LevelCardContentProps {
  title: string;
  count: number;
  titleColor: string;
  icon: number;
}

function LevelCardContent({
  title,
  count,
  titleColor,
  icon,
}: LevelCardContentProps) {
  return (
    <View
      className="flex-1 flex-row items-center p-3"
      style={{ gap: 12 }}
    >
      <Image
        source={icon}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
      <View className="flex-1 items-start py-1.5" style={{ gap: 6 }}>
        <Text
          className="font-cairo-semibold text-[13px]"
          style={{ color: titleColor }}
        >
          {title}
        </Text>
        <Text className="font-cairo-bold text-[15px] text-[#111111]">
          {count}
        </Text>
      </View>
    </View>
  );
}

/** اختر نوع اعلانك: a normal or a featured ad, with what's left of each. */
export default function AdLevelSelector({
  value,
  onChange,
  normalCount,
  featuredCount,
}: AdLevelSelectorProps) {
  const isPremium = value === 'premium';

  return (
    <View className="w-full">
      <Text
        className="mb-3 font-cairo-medium text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        اختر نوع اعلانك
      </Text>

      <View className="flex-row" style={{ gap: 8 }}>
        {/* First so that it renders on the right in RTL, as in Figma */}
        <TouchableOpacity
          testID="ad-level-normal"
          activeOpacity={0.85}
          onPress={() => onChange('normal')}
          className="flex-1 overflow-hidden rounded-lg bg-[#F5F7F9]"
          style={{
            borderWidth: 1.5,
            borderColor: isPremium ? 'transparent' : '#15304D',
          }}
        >
          <LevelCardContent
            title="إعلان عادي"
            count={normalCount}
            titleColor="#15304D"
            icon={require('@/assets/icons/add-listing/normal-icon.svg')}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="ad-level-premium"
          activeOpacity={0.85}
          onPress={() => onChange('premium')}
          className="flex-1 overflow-hidden rounded-lg"
          style={{
            borderWidth: 1.5,
            borderColor: isPremium ? '#15304D' : 'transparent',
          }}
        >
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          >
            <LevelCardContent
              title="إعلان مميز"
              count={featuredCount}
              titleColor="#111111"
              icon={require('@/assets/icons/add-listing/premium-icon.svg')}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

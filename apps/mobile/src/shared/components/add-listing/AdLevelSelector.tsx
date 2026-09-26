import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';
import { AdLevel } from '@/shared/store/useListingStore';

interface AdLevelSelectorProps {
  value: AdLevel;
  onChange: (level: AdLevel) => void;
}

export default function AdLevelSelector({
  value,
  onChange,
}: AdLevelSelectorProps) {
  const isPremium = value === 'premium';
  const isNormal = value === 'normal';

  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-3 font-cairo-semibold text-base text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        اختر نوع اعلانك
      </Text>

      <View className="h-[72px] flex-row gap-3" style={{ gap: 12 }}>
        {/* Regular Ad Option (إعلان عادي) - Placed first so in RTL it renders on the right matching Figma */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onChange('normal')}
          className="flex-1"
          style={{
            height: 72,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isNormal ? '#15304D' : '#ECECEC',
            backgroundColor: isNormal ? '#F4F8FB' : '#FFFFFF',
            opacity: isNormal ? 1 : 0.8,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/icons/add-listing/normal-icon.svg')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: isNormal ? '#15304D' : '#64748B',
                }}
                contentFit="contain"
              />
              <View className="items-start">
                <Text
                  className={`font-cairo-semibold text-[14px] ${
                    isNormal ? 'text-[#15304D]' : 'text-[#111111]'
                  }`}
                >
                  إعلان عادي
                </Text>
                <Text
                  className={`font-cairo-medium text-[12px] ${
                    isNormal ? 'text-[#15304D]/70' : 'text-[#64748B]'
                  }`}
                >
                  يظهر ضمن القائمة
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Premium Ad Option (إعلان مميز) - Gradient background: linear-gradient(90deg, #FF8D28 0%, #FACC15 100%) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onChange('premium')}
          className="flex-1"
          style={{
            height: 72,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isPremium ? '#15304D' : 'transparent',
            opacity: isPremium ? 1 : 0.85,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['#FF8D28', '#FACC15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Image
                source={require('@/assets/icons/add-listing/premium-icon.svg')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: '#111111',
                }}
                contentFit="contain"
              />
              <View className="items-start">
                <Text className="font-cairo-semibold text-[14px] text-[#111111]">
                  إعلان مميز
                </Text>
                <Text className="font-cairo-medium text-[12px] text-[#111111]">
                  يظهر أعلى القائمة
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

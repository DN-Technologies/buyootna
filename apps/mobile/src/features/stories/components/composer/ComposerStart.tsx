import { Image } from 'expo-image';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ComposerStartProps {
  preparing: boolean;
  onPickLibrary: () => void;
  onTakePhoto: () => void;
  onClose: () => void;
}

const GOLD = (alpha: number) => `rgba(201, 151, 77, ${alpha})`;

/**
 * «اضف قصة جديدة» (Figma 9516:5513): a photo or a video, from the gallery
 * or the camera.
 */
export default function ComposerStart({
  preparing,
  onPickLibrary,
  onTakePhoto,
  onClose,
}: ComposerStartProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-[#111111]">
      <TouchableOpacity
        testID="composer-close"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="إغلاق"
        className="absolute z-10 size-[40px] items-center justify-center rounded-full"
        // The app's RTL swaps left and right: this is Figma's right 16
        style={{ top: insets.top + 16, left: 16 }}
      >
        <Image
          source={require('@/assets/icons/stories/start-close.svg')}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center px-[20px]">
        <View className="w-full max-w-[335px] items-center" style={{ gap: 16 }}>
          <View className="items-center" style={{ gap: 12 }}>
            {/* The gold glow: two faint rings around a thin gold circle */}
            <View className="items-center justify-center pb-[15px]">
              <View
                className="size-[128px] items-center justify-center rounded-full"
                style={{ backgroundColor: GOLD(0.04) }}
              >
                <View
                  className="size-[108px] items-center justify-center rounded-full"
                  style={{ backgroundColor: GOLD(0.07) }}
                >
                  <View
                    className="size-[88px] items-center justify-center rounded-full bg-[#111111]"
                    style={{ borderWidth: 1.486, borderColor: GOLD(0.23) }}
                  >
                    <View className="size-[58px] items-center justify-center rounded-full bg-[#0B2C49]">
                      <Image
                        source={require('@/assets/icons/stories/start-play.svg')}
                        style={{ width: 29.99, height: 29.99 }}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View className="w-full items-center" style={{ gap: 8 }}>
              <Text className="text-center font-cairo-bold text-[16px] text-white">
                اضف قصة جديدة
              </Text>
              <Text
                className="w-[293px] text-center font-cairo-semibold text-[14px] leading-[21px] text-[#A0A0A0]"
                style={{ writingDirection: 'rtl' }}
              >
                صورة أو فيديو حتى 30 ثانية{' '}
                <Text className="font-cairo">ستظل ظاهرة لمدة 24 ساعة.</Text>
              </Text>
            </View>
          </View>

          {preparing && (
            <ActivityIndicator testID="composer-preparing" color="#FFFFFF" />
          )}

          <TouchableOpacity
            testID="composer-pick-library"
            disabled={preparing}
            onPress={onPickLibrary}
            activeOpacity={0.8}
            className="h-[44px] w-full flex-row items-center justify-center rounded-[24px] bg-white"
            style={{ gap: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <Image
              source={require('@/assets/icons/stories/gallery.svg')}
              style={{ width: 16, height: 16 }}
              contentFit="contain"
            />
            <Text className="font-cairo-bold text-[14px] leading-[21px] text-[#111111]">
              اختر من المعرض
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="composer-take-photo"
            disabled={preparing}
            onPress={onTakePhoto}
            activeOpacity={0.8}
            className="h-[44px] w-full flex-row items-center justify-center rounded-[24px]"
            style={{ gap: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
          >
            <Image
              source={require('@/assets/icons/stories/camera.svg')}
              style={{ width: 16, height: 16 }}
              contentFit="contain"
            />
            <Text className="font-cairo-bold text-[14px] leading-[21px] text-white">
              الكاميرا
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

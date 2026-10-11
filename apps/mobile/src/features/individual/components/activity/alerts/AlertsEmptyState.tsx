import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import ActivityCardSkeleton from '@/shared/components/skeletons/ActivityCardSkeleton';

export interface AlertsEmptyStateProps {
  isLoading: boolean;
  error: string | null;
  onAddAlertPress?: () => void;
}

function EmptyAlertsBellIcon() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 64, height: 68, position: 'relative' }}>
        <Svg width={62} height={66} viewBox="0 0 63 66" fill="none">
          <Path
            d="M0.941479 41.707C0.260988 46.1679 3.30331 49.2641 7.02828 50.8072C21.3091 56.7231 41.1822 56.7231 55.463 50.8072C59.188 49.2641 62.2303 46.1679 61.5498 41.707C61.1316 38.9655 59.0637 36.6827 57.5316 34.4536C55.5249 31.4979 55.3255 28.2741 55.3252 24.8443C55.3252 11.5895 44.5444 0.844442 31.2456 0.844442C17.9469 0.844442 7.16611 11.5895 7.16611 24.8443C7.16582 28.2741 6.96642 31.4979 4.95966 34.4536C3.4276 36.6827 1.35969 38.9655 0.941479 41.707Z"
            stroke="#111111"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M18.4468 55.2445C19.9139 60.7652 25.0884 64.8444 31.2467 64.8444C37.405 64.8444 42.5795 60.7652 44.0467 55.2445"
            stroke="#111111"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        {/* Red "0" Badge */}
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 0,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#9C1E28',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text className="font-cairo-semibold text-[12px] leading-[20px] text-white">
            0
          </Text>
        </View>
      </View>

      {/* Bell Base Shadow */}
      <View style={{ marginTop: 4 }}>
        <Svg width={64} height={5} viewBox="0 0 64 5" fill="none">
          <Path
            d="M32 5C49.6731 5 64 3.88072 64 2.5C64 1.11929 49.6731 0 32 0C14.3269 0 0 1.11929 0 2.5C0 3.88072 14.3269 5 32 5Z"
            fill="#F2F2F2"
          />
        </Svg>
      </View>
    </View>
  );
}

export default function AlertsEmptyState({
  isLoading,
  error,
  onAddAlertPress,
}: AlertsEmptyStateProps) {
  if (isLoading) {
    return (
      <View>
        {[1, 2, 3].map((key) => (
          <ActivityCardSkeleton key={key} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center py-10">
        <Text className="font-cairo-medium text-red-500">{error}</Text>
      </View>
    );
  }

  const handlePress = () => {
    if (onAddAlertPress) {
      onAddAlertPress();
    } else {
      router.push('/add-alert' as any);
    }
  };

  return (
    <View className="w-full items-center px-4 pt-12 pb-8">
      <EmptyAlertsBellIcon />

      <View className="mt-4 w-full items-center">
        <Text className="font-cairo-bold text-center text-base text-[#111111]">
          لا توجد تنبيهات حاليا
        </Text>
        <Text className="mt-2 font-cairo-semibold text-center text-sm leading-6 tracking-[0.28px] text-[#6B6A6A]">
          أنشئ تنبيهك المخصص الآن للعقارات أو المزادات، وسنقوم بإرسال إشعار فوري
          لهاتفك بمجرد توفر أي عقار يطابق مواصفاتك تماماً.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        testID="create-first-alert-btn"
        accessibilityRole="button"
        accessibilityLabel="أنشئ تنبيهك الأول الآن"
        className="mt-6 h-11 w-full items-center justify-center rounded-full bg-[#15304D] px-5"
      >
        <Text className="font-cairo-semibold leading-[22px] text-sm text-white">
          أنشئ تنبيهك الأول الآن
        </Text>
      </TouchableOpacity>
    </View>
  );
}

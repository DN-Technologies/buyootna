import { Text, TouchableOpacity, View } from 'react-native';

interface AdPreviewActionsProps {
  onEditPress: () => void;
  onFeaturePress: () => void;
  onDeletePress: () => void;
  // Set while the ad is featured («مميز حتى 20 نوفمبر»): shown instead of
  // «تمييز», which stayed on a featured ad (QA)
  featuredLabel?: string | null;
  // Offices, on a live ad: «تم البيع» / «تم التأجير» / «تمت المبادلة»
  markDoneLabel?: string;
  onMarkDonePress?: () => void;
}

/** تعديل / تمييز / حذف, and the office's mark-as-done under them. */
export default function AdPreviewActions({
  onEditPress,
  onFeaturePress,
  onDeletePress,
  featuredLabel,
  markDoneLabel,
  onMarkDonePress,
}: AdPreviewActionsProps) {
  const button = 'h-[40px] flex-1 items-center justify-center rounded-full';
  const label = 'font-cairo-semibold text-sm leading-[22px]';

  return (
    <>
      <View className="px-6 flex-row items-center gap-3 mb-8">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onEditPress}
          className={`${button} bg-[#15304D]`}
        >
          <Text className={`${label} text-white`}>تعديل</Text>
        </TouchableOpacity>

        {featuredLabel ? (
          <View
            testID="ad-preview-featured"
            accessibilityRole="text"
            className={`${button} bg-[#FFF7EB] px-2`}
          >
            <Text
              className="font-cairo-semibold text-xs leading-[18px] text-[#B28648]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {featuredLabel}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            testID="ad-preview-feature"
            activeOpacity={0.8}
            onPress={onFeaturePress}
            className={`${button} border border-[#B28648] bg-white`}
          >
            <Text className={`${label} text-[#B28648]`}>تمييز</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onDeletePress}
          className={`${button} border border-[#9C1E28] bg-white`}
        >
          <Text className={`${label} text-[#9C1E28]`}>حذف</Text>
        </TouchableOpacity>
      </View>

      {!!onMarkDonePress && (
        <View className="px-6 mb-8 -mt-4">
          <TouchableOpacity
            testID="ad-preview-mark-done"
            activeOpacity={0.8}
            onPress={onMarkDonePress}
            className="h-[40px] w-full items-center justify-center rounded-full border border-[#15304D] bg-white"
          >
            <Text className={`${label} text-[#15304D]`}>
              {markDoneLabel ?? 'تم البيع'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

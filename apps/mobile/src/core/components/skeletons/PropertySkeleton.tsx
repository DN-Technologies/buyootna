import { Dimensions, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_CARD_WIDTH = SCREEN_WIDTH * 0.75;

export default function PropertySkeleton() {
  return (
    <View
      className="mb-5 mr-4 overflow-hidden rounded-md border border-gray-200 bg-white"
      style={{
        width: HORIZONTAL_CARD_WIDTH,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* Image Placeholder with Curved Cutout at the bottom */}
      <View className="relative h-48 w-full bg-slate-200">
        <View className="absolute bottom-0 left-0 right-0 h-2 w-full rounded-t-[40px] bg-white" />
      </View>

      {/* Content Placeholder */}
      <View className="px-4 py-2">
        {/* Price & Company Row */}
        <View className="mb-3 flex-row justify-between">
          <View className="items-start">
            {/* Price placeholder */}
            <View className="h-6 w-28 rounded-md bg-slate-200" />
            {/* Company name placeholder */}
            <View className="mt-2 h-4 w-36 rounded-md bg-slate-100" />
          </View>
          {/* Time ago placeholder */}
          <View className="mt-1.5 h-4 w-16 rounded-md bg-slate-100" />
        </View>

        {/* Specs Row (Area, Beds, Baths) */}
        <View className="mb-2 flex-row items-center gap-3">
          {/* Type & Area placeholder */}
          <View className="h-4 w-20 rounded-md bg-slate-200" />

          {/* Separator */}
          <View className="h-3 w-[1px] bg-slate-200" />

          {/* Beds placeholder */}
          <View className="h-4 w-10 rounded-md bg-slate-200" />

          {/* Separator */}
          <View className="h-3 w-[1px] bg-slate-200" />

          {/* Baths placeholder */}
          <View className="h-4 w-10 rounded-md bg-slate-200" />
        </View>

        {/* Location Row */}
        <View className="mb-2 flex-row items-center gap-1.5">
          {/* Location icon placeholder */}
          <View className="h-4 w-4 rounded-full bg-slate-100" />
          {/* Location text placeholder */}
          <View className="h-4 w-48 rounded-md bg-slate-100" />
        </View>

        {/* Action Buttons Footer */}
        <View className="flex-row items-center justify-between gap-2 pt-2">
          <View className="h-10 flex-1 rounded-[24px] border border-slate-100 bg-slate-50" />
          <View className="h-10 flex-1 rounded-[24px] border border-slate-100 bg-slate-50" />
          <View className="h-10 flex-1 rounded-[24px] border border-slate-100 bg-slate-50" />
        </View>
      </View>
    </View>
  );
}

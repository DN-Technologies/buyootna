import { DimensionValue, View } from 'react-native';

interface PropertyListSkeletonProps {
  cardWidth?: DimensionValue;
}

export default function PropertyListSkeleton({
  cardWidth = '100%',
}: PropertyListSkeletonProps) {
  return (
    <View
      className="mb-4 rounded-md border border-[#ECECEC] bg-[#FEFEFE] p-4"
      style={{
        width: cardWidth,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      }}
    >
      {/* Row 1: Type icon + Title */}
      <View className="flex-row items-center justify-between">
        <View className="h-8 w-8 rounded-md bg-slate-200" />
        <View className="mx-2 h-4 flex-1 rounded-md bg-slate-100" />
      </View>

      {/* Row 2: Stats — price, beds, area */}
      <View className="mt-3 flex-row items-center justify-between">
        <View className="h-4 w-16 rounded-md bg-slate-200" />
        <View className="h-4 w-8 rounded-md bg-slate-100" />
        <View className="h-4 w-14 rounded-md bg-slate-100" />
      </View>

      {/* Row 3: Property Income */}
      <View className="mt-3 h-4 w-32 rounded-md bg-slate-100" />

      {/* Row 4: Actions */}
      <View className="mt-4 flex-row items-center justify-between gap-3">
        <View className="h-9 flex-1 rounded-[14px] bg-slate-100" />
        <View className="h-9 w-9 rounded-md bg-slate-100" />
        <View className="h-9 w-9 rounded-md bg-slate-100" />
      </View>
    </View>
  );
}

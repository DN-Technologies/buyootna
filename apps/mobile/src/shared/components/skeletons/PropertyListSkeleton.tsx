import { DimensionValue, View } from 'react-native';

interface PropertyListSkeletonProps {
  cardWidth?: DimensionValue;
}

export default function PropertyListSkeleton({
  cardWidth = '100%',
}: PropertyListSkeletonProps) {
  return (
    <View
      className="mb-4 rounded-2xl border border-gray-100/90 bg-white p-4"
      style={{
        width: cardWidth,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      }}
    >
      {/* Row 1: Price (Right) & Featured Badge (Left) */}
      <View className="flex-row items-center justify-between">
        <View className="h-6 w-28 rounded-md bg-slate-200" />
        <View className="h-6 w-14 rounded-lg bg-slate-100" />
      </View>

      {/* Row 2: Category Badge, Location, Area */}
      <View className="mt-3 flex-row items-center justify-between gap-2">
        <View className="h-6 w-16 rounded-lg bg-slate-100" />
        <View className="h-4 flex-1 rounded-md bg-slate-100" />
        <View className="h-4 w-16 rounded-md bg-slate-100" />
      </View>

      {/* Row 3: Property Income */}
      <View className="mt-2.5 flex-row items-center justify-end gap-2">
        <View className="h-4 w-20 rounded-md bg-slate-100" />
        <View className="h-4 w-24 rounded-md bg-slate-200" />
      </View>

      {/* Row 4: Actions (View Details & Icons) */}
      <View className="mt-3.5 flex-row items-center justify-between gap-3">
        <View className="h-11 flex-1 rounded-2xl bg-slate-100" />
        <View className="flex-row items-center gap-3">
          <View className="h-9 w-9 rounded-full bg-slate-100" />
          <View className="h-9 w-9 rounded-full bg-slate-100" />
        </View>
      </View>
    </View>
  );
}

import { View } from 'react-native';

/** Placeholder of a saved property in المفضلة (a compact card, no photo). */
export default function FavoritePropertySkeleton() {
  return (
    <View
      testID="favorite-property-skeleton"
      className="mb-3 w-full rounded-[16px] border border-[#ECECEC] bg-[#FEFEFE] p-3"
    >
      {/* Price (right) and featured badge (left) */}
      <View className="flex-row items-center justify-between pb-1">
        <View className="h-7 w-32 rounded-md bg-slate-200" />
        <View className="h-5 w-14 rounded-md bg-slate-100" />
      </View>

      {/* Category chip, area, location */}
      <View className="flex-row items-center gap-3.5 py-1.5">
        <View className="h-6 w-20 rounded-md bg-slate-100" />
        <View className="h-4 w-16 rounded-md bg-slate-200" />
        <View className="h-4 w-28 rounded-md bg-slate-100" />
      </View>

      {/* Details button, share and heart */}
      <View className="flex-row items-center justify-between gap-2.5 pt-2">
        <View className="h-[32px] flex-1 rounded-[14px] bg-slate-100" />
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 rounded-lg bg-slate-100" />
          <View className="h-8 w-8 rounded-lg bg-slate-100" />
        </View>
      </View>
    </View>
  );
}

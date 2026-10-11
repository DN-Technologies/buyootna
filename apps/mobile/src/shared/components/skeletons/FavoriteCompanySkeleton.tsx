import { View } from 'react-native';

/** Placeholder of a saved company in المفضلة. */
export default function FavoriteCompanySkeleton() {
  return (
    <View
      testID="favorite-company-skeleton"
      className="mb-3 w-full rounded-[16px] border border-[#ECECEC] bg-white p-4"
    >
      {/* Logo, name + category, and the heart */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 pl-2">
          <View className="h-[64px] w-[64px] rounded-sm bg-slate-200" />
          <View className="gap-2">
            <View className="h-4 w-32 rounded-md bg-slate-200" />
            <View className="h-3 w-24 rounded-md bg-slate-100" />
          </View>
        </View>
        <View className="h-6 w-6 rounded-full bg-slate-100" />
      </View>

      {/* Three stats between dividers */}
      <View className="my-3 flex-row items-center justify-between border-y border-gray-100 py-2.5">
        {[0, 1, 2].map((i) => (
          <View key={i} className="flex-1 flex-row items-center">
            <View className="flex-1 items-center gap-1.5">
              <View className="h-3 w-10 rounded-md bg-slate-200" />
              <View className="h-3 w-14 rounded-md bg-slate-100" />
            </View>
            {i < 2 && <View className="h-6 w-[1px] bg-gray-200" />}
          </View>
        ))}
      </View>

      {/* Two action buttons */}
      <View className="flex-row items-center gap-2.5">
        <View className="h-10 flex-1 rounded-[24px] bg-slate-200" />
        <View className="h-10 flex-1 rounded-[24px] bg-slate-100" />
      </View>
    </View>
  );
}

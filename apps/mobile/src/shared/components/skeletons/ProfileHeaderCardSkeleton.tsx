import { View } from 'react-native';

export default function ProfileHeaderCardSkeleton() {
  return (
    <View className="mx-5 mb-8 mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
      {/* Top Banner */}
      <View className="h-20 w-full bg-slate-200" />

      <View className="px-5 pb-5">
        {/* Avatar & Account Type Row */}
        <View className="-mt-10 mb-2 flex-row items-start justify-between">
          <View className="h-20 w-20 rounded-xl border-4 border-white bg-slate-300" />
          <View className="mt-20 h-6 w-[72px] rounded-full bg-slate-100" />
        </View>

        {/* Name / Email Lines */}
        <View className="mb-5 gap-2">
          <View className="h-4.5 w-28 rounded bg-slate-200" />
          <View className="h-3 w-36 rounded bg-slate-100" />
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-between gap-2">
          <View className="h-9 flex-1 rounded-[24px] bg-slate-100" />
          <View className="h-9 flex-1 rounded-[24px] bg-slate-100" />
          <View className="h-9 flex-1 rounded-[24px] bg-slate-100" />
        </View>
      </View>
    </View>
  );
}

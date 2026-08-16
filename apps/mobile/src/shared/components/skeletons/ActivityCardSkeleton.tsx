import { View } from 'react-native';

export default function ActivityCardSkeleton() {
  return (
    <View className="z-10 mb-4 overflow-hidden rounded-md border border-[#FEFEFE] bg-[#FEFEFE] shadow-sm shadow-gray-200/30">
      {/* --- Image Header --- */}
      <View className="h-[210px] w-full bg-slate-200" />

      {/* --- Content Body --- */}
      <View className="p-4">
        {/* Title Row */}
        <View className="mb-3 h-5 w-32 rounded-md bg-slate-200" />

        {/* Price & Date Row */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="h-5 w-20 rounded-md bg-slate-200" />
          <View className="h-3.5 w-28 rounded bg-slate-100" />
        </View>

        {/* Stats Box */}
        <View className="flex-row items-center justify-around rounded-2xl border border-gray-100/50 bg-[#F8FAFC] px-2 py-3">
          <View className="flex-1 items-center gap-1.5">
            <View className="h-3 w-16 rounded bg-slate-100" />
            <View className="h-4 w-6 rounded bg-slate-200" />
          </View>
          <View className="h-7 w-[1px] bg-gray-200/50" />
          <View className="flex-1 items-center gap-1.5">
            <View className="h-3 w-14 rounded bg-slate-100" />
            <View className="h-4 w-6 rounded bg-slate-200" />
          </View>
          <View className="h-7 w-[1px] bg-gray-200/50" />
          <View className="flex-1 items-center gap-1.5">
            <View className="h-3 w-16 rounded bg-slate-100" />
            <View className="h-4 w-6 rounded bg-slate-200" />
          </View>
        </View>
      </View>
    </View>
  );
}

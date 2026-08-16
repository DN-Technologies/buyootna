import { View } from 'react-native';

export default function ProfileHomeSkeleton() {
  return (
    <View className="px-5">
      {/* --- Top Header Bar --- */}
      <View className="flex-row items-center justify-between pb-6 pt-4">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 rounded-full bg-slate-200" />
          <View className="gap-2">
            <View className="h-3 w-16 rounded bg-slate-100" />
            <View className="h-4 w-28 rounded bg-slate-200" />
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-10 w-10 rounded-full bg-slate-100" />
          <View className="h-10 w-10 rounded-full bg-slate-100" />
        </View>
      </View>

      {/* --- 2x2 Stats Grid --- */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <View className="min-h-[92px] flex-1 justify-between rounded-md border border-[#ECECEC] bg-white p-4">
            <View className="h-10 w-10 rounded-full bg-slate-100" />
            <View className="gap-1.5">
              <View className="h-3.5 w-16 rounded bg-slate-200" />
              <View className="h-3.5 w-14 rounded bg-slate-100" />
            </View>
          </View>
          <View className="min-h-[92px] flex-1 justify-between rounded-md border border-[#ECECEC] bg-white p-4">
            <View className="h-10 w-10 rounded-full bg-slate-100" />
            <View className="gap-1.5">
              <View className="h-3.5 w-20 rounded bg-slate-200" />
              <View className="h-3.5 w-8 rounded bg-slate-100" />
            </View>
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="min-h-[92px] flex-1 justify-between rounded-md border border-[#ECECEC] bg-white p-4">
            <View className="h-10 w-10 rounded-full bg-slate-100" />
            <View className="gap-1.5">
              <View className="h-3.5 w-20 rounded bg-slate-200" />
              <View className="h-3.5 w-10 rounded bg-slate-100" />
            </View>
          </View>
          <View className="min-h-[92px] flex-1 justify-between rounded-md border border-[#ECECEC] bg-white p-4">
            <View className="h-10 w-10 rounded-full bg-slate-100" />
            <View className="gap-1.5">
              <View className="h-3.5 w-24 rounded bg-slate-200" />
              <View className="h-3.5 w-14 rounded bg-slate-100" />
            </View>
          </View>
        </View>
      </View>

      {/* --- Banner Block --- */}
      <View className="mt-4 gap-2 rounded-md border border-[#ECECEC] bg-[#F9FAFE] p-4">
        <View className="h-4 w-40 rounded bg-slate-200" />
        <View className="h-3.5 w-56 rounded bg-slate-100" />
      </View>
    </View>
  );
}

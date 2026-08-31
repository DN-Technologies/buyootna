import { View } from 'react-native';

export default function OfficeListSkeleton() {
  return (
    <View
      className="mb-4 w-full rounded-2xl border border-gray-100/90 bg-white p-4"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      }}
    >
      {/* Row 1: Logo & Name/Location (Right in RTL) + Heart (Left in RTL) */}
      <View className="flex-row items-start justify-between gap-3">
        {/* Right in RTL: Logo & Info */}
        <View className="flex-1 flex-row items-center gap-3">
          {/* Logo Squircle */}
          <View className="h-14 w-14 rounded-2xl bg-slate-200" />

          {/* Name & Location Skeleton */}
          <View className="flex-1 gap-2">
            <View className="h-4 w-32 rounded-md bg-slate-200" />
            <View className="h-3 w-20 rounded-md bg-slate-100" />
          </View>
        </View>

        {/* Left in RTL: Heart Button */}
        <View className="h-6 w-6 rounded-full bg-slate-100" />
      </View>

      {/* Row 2: Service Tags */}
      <View className="mt-3 flex-row items-center justify-end gap-1.5">
        <View className="h-6 w-14 rounded-lg bg-slate-100" />
        <View className="h-6 w-12 rounded-lg bg-slate-100" />
        <View className="h-6 w-16 rounded-lg bg-slate-100" />
      </View>

      {/* Divider */}
      <View className="my-3 h-[1px] w-full bg-gray-100" />

      {/* Row 3: Stats (Properties Count & Rating) */}
      <View className="flex-row items-center justify-between">
        <View className="h-3.5 w-16 rounded-md bg-slate-100" />
        <View className="h-3.5 w-24 rounded-md bg-slate-100" />
      </View>

      {/* Row 4: Actions (Call & Chat Buttons) */}
      <View className="mt-3 flex-row items-center justify-between gap-3">
        <View className="h-11 flex-1 rounded-full bg-slate-100" />
        <View className="h-11 flex-1 rounded-full bg-slate-100" />
      </View>
    </View>
  );
}

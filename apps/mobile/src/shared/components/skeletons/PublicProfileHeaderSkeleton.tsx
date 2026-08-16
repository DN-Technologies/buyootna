import { View } from 'react-native';

export default function PublicProfileHeaderSkeleton() {
  return (
    <View className="mb-4">
      {/* Cover Banner */}
      <View className="mx-5 h-24 rounded-t-md bg-slate-200" />

      {/* Profile Card Overlay */}
      <View className="mx-5 -mt-10 rounded-b-md border border-gray-100 bg-white p-5 shadow-sm">
        {/* Overlapping Avatar */}
        <View className="absolute -top-10 left-5 z-10 h-20 w-20 rounded-2xl border-4 border-white bg-slate-300" />

        {/* Spacer to clear the avatar */}
        <View className="h-10" />

        {/* Name / Rating Row */}
        <View className="mt-3 flex-row items-start justify-between">
          <View className="gap-2">
            <View className="h-5 w-28 rounded-md bg-slate-200" />
            <View className="h-3.5 w-20 rounded-md bg-slate-100" />
          </View>
          <View className="h-5 w-16 rounded-full bg-slate-100" />
        </View>

        {/* Stats Bar */}
        <View className="mt-4 flex-row items-center justify-between rounded-xl bg-[#F8F9FC] p-4">
          <View className="flex-1 items-center gap-1.5">
            <View className="h-4 w-6 rounded bg-slate-200" />
            <View className="h-3 w-14 rounded bg-slate-100" />
          </View>
          <View className="h-6 w-[1px] bg-slate-200" />
          <View className="flex-1 items-center gap-1.5">
            <View className="h-4 w-6 rounded bg-slate-200" />
            <View className="h-3 w-16 rounded bg-slate-100" />
          </View>
          <View className="h-6 w-[1px] bg-slate-200" />
          <View className="flex-1 items-center gap-1.5">
            <View className="h-4 w-12 rounded bg-slate-200" />
            <View className="h-3 w-14 rounded bg-slate-100" />
          </View>
        </View>
      </View>
    </View>
  );
}

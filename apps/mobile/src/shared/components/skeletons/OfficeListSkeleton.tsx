import { View } from 'react-native';

export default function OfficeListSkeleton() {
  return (
    <View
      className="mb-4 w-full flex-row overflow-hidden rounded-lg border border-[#ECECEC] bg-white"
      style={{
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* Logo Panel */}
      <View className="w-[130px] bg-slate-200" />
      <View className="flex-1 p-4">
        {/* Header: Name & Heart */}
        <View className="mb-2 flex-row items-center justify-between">
          <View className="h-4 flex-1 rounded-md bg-slate-200" />
          <View className="ml-2 h-5 w-5 rounded-full bg-slate-100" />
        </View>

        {/* Stats: Location & Rating */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="h-3 w-24 rounded-md bg-slate-100" />
          <View className="h-3 w-10 rounded-md bg-slate-100" />
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-2">
          <View className="h-10 flex-1 rounded-[24px] bg-slate-100" />
          <View className="h-10 flex-1 rounded-[24px] bg-slate-100" />
          <View className="h-10 flex-1 rounded-[24px] bg-slate-100" />
        </View>
      </View>
    </View>
  );
}

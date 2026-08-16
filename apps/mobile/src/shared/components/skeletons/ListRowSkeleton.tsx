import { View } from 'react-native';

interface ListRowSkeletonProps {
  showIcon?: boolean;
  showTrailing?: boolean;
}

export default function ListRowSkeleton({
  showIcon = true,
  showTrailing = false,
}: ListRowSkeletonProps) {
  return (
    <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
      <View className="flex-1 flex-row items-center gap-3">
        {showIcon && <View className="h-11 w-11 rounded-full bg-slate-200" />}
        <View className="flex-1 gap-2">
          <View className="h-3.5 w-32 rounded bg-slate-200" />
          <View className="h-3 w-24 rounded bg-slate-100" />
        </View>
      </View>
      {showTrailing && <View className="h-3.5 w-16 rounded bg-slate-100" />}
    </View>
  );
}

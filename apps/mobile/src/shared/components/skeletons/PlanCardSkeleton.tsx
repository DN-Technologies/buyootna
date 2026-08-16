import { View } from 'react-native';

export default function PlanCardSkeleton() {
  return (
    <View className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-sm shadow-gray-200/50">
      {/* Name */}
      <View className="mb-3 h-4 w-24 rounded bg-slate-200" />
      {/* Price Row */}
      <View className="mb-4 h-6 w-32 rounded bg-slate-200" />

      {/* Divider */}
      <View className="my-4 h-[1px] bg-gray-100" />

      {/* Features List */}
      <View className="mb-6 gap-3">
        {[1, 2, 3].map((key) => (
          <View key={key} className="h-3.5 w-full rounded bg-slate-100" />
        ))}
      </View>

      {/* CTA Button */}
      <View className="h-12 w-full rounded-[24px] bg-slate-100" />
    </View>
  );
}

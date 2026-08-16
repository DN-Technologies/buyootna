import { View } from 'react-native';

export default function BalanceSummarySkeleton() {
  return (
    <View className="mx-5 mt-4 flex-row items-center gap-3">
      {[1, 2, 3].map((key) => (
        <View key={key} className="flex-1 gap-2 rounded-[16px] bg-slate-100 p-4">
          <View className="h-7 w-8 rounded-md bg-slate-200" />
          <View className="h-3.5 w-10 rounded bg-slate-200" />
        </View>
      ))}
    </View>
  );
}

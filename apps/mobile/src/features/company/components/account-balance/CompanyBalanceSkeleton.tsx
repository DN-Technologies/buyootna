import { View } from 'react-native';

/** A سجل الباقات row while it loads: dot, plan name, end date, id. */
export function SubscriptionHistoryRowSkeleton() {
  return (
    <View
      className="w-full flex-row items-end rounded-lg bg-[#F9FAFE] p-4"
      style={{ gap: 12 }}
    >
      <View className="flex-1 flex-row items-start" style={{ gap: 10 }}>
        <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-200" />
        <View className="flex-1 items-start" style={{ gap: 10 }}>
          <View className="h-3.5 w-24 rounded bg-slate-200" />
          <View className="h-3 w-36 rounded bg-slate-100" />
        </View>
      </View>
      <View className="h-3 w-16 rounded bg-slate-100" />
    </View>
  );
}

/**
 * The company رصيد الحساب screen while its subscription loads: the intro
 * line, the plan card and the start of the history.
 */
export default function CompanyBalanceSkeleton() {
  return (
    <View
      testID="company-balance-skeleton"
      className="px-4 pt-3"
      style={{ gap: 24 }}
    >
      <View className="w-full" style={{ gap: 20 }}>
        <View className="h-3.5 w-64 self-center rounded bg-slate-100" />

        {/* Plan card: badge, three lines, price, the details toggle */}
        <View className="w-full rounded-lg bg-[#F9FAFE] px-4 py-3" style={{ gap: 16 }}>
          <View className="flex-row items-start" style={{ gap: 12 }}>
            <View className="h-[30px] w-[30px] rounded-full bg-slate-200" />
            <View className="flex-1 items-start" style={{ gap: 8 }}>
              <View className="h-3 w-20 rounded bg-slate-100" />
              <View className="h-4 w-28 rounded bg-slate-200" />
              <View className="h-3 w-40 rounded bg-slate-100" />
            </View>
            <View className="h-5 w-14 rounded bg-slate-200" />
          </View>
          <View className="h-4 w-20 self-center rounded bg-slate-100" />
        </View>
      </View>

      <View className="w-full" style={{ gap: 10 }}>
        <View className="flex-row items-center justify-between">
          <View className="h-4 w-24 rounded bg-slate-200" />
          <View className="h-3.5 w-16 rounded bg-slate-100" />
        </View>
        <View style={{ gap: 12 }}>
          <SubscriptionHistoryRowSkeleton />
          <SubscriptionHistoryRowSkeleton />
        </View>
      </View>
    </View>
  );
}

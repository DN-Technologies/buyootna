import React from 'react';
import { View } from 'react-native';

/**
 * A skeleton placeholder that mirrors the home screen's actual header —
 * the tab pill toggle + filter/map buttons, and the filter pills row —
 * so the screen feels "alive" while real data loads.
 */
interface HomeHeaderSkeletonProps {
  withHorizontalPadding?: boolean;
}

export default function HomeHeaderSkeleton({
  withHorizontalPadding = true,
}: HomeHeaderSkeletonProps) {
  return (
    <View className={withHorizontalPadding ? 'px-5' : ''}>
      {/* ── 1. Tabs & Controls Row ── */}
      <View className="mb-4 flex-row items-center gap-2">
        <View className="h-[45px] flex-1 flex-row items-center justify-center gap-6 rounded-full border border-gray-100 bg-[#F8FAFC] px-4">
          <View className="h-3 w-16 rounded-md bg-slate-200" />
          <View className="h-3 w-20 rounded-md bg-slate-100" />
        </View>
        <View className="h-[45px] w-[45px] rounded-full bg-slate-100" />
        <View className="h-[45px] w-[45px] rounded-full bg-slate-100" />
      </View>

      {/* ── 2. Filter Pills Row ── */}
      <View
        className="mb-4 flex-row gap-3"
        style={{ flexDirection: 'row-reverse' }}
      >
        <View className="h-9 flex-1 rounded-full bg-slate-100" />
        <View className="h-9 flex-1 rounded-full bg-slate-100" />
        <View className="h-9 flex-1 rounded-full bg-slate-100" />
      </View>

      {/* ── 3. View Mode Toggle Row ── */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1 rounded-xl bg-slate-50 p-1">
          <View className="h-8 w-9 rounded-lg bg-slate-200" />
          <View className="h-8 w-9 rounded-lg bg-slate-100" />
        </View>
      </View>
    </View>
  );
}

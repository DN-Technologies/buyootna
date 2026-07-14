import React from 'react';
import { View } from 'react-native';

/**
 * A skeleton placeholder that mirrors the HomeHeader + HomeSearchBar +
 * HomePrimaryTabs + HomeFilterPills layout so the screen feels "alive"
 * while real data loads.
 */
interface HomeHeaderSkeletonProps {
  withHorizontalPadding?: boolean;
}

export default function HomeHeaderSkeleton({
  withHorizontalPadding = true,
}: HomeHeaderSkeletonProps) {
  return (
    <View className={`pt-4 ${withHorizontalPadding ? 'px-5' : ''}`}>
      {/* ── 1. Header Row (Avatar + Greeting  |  Icons) ── */}
      <View className="mb-2 flex-row items-center justify-between">
        {/* Right: avatar + text */}
        <View className="flex-row items-center gap-2">
          <View className="h-12 w-12 rounded-full bg-slate-200" />
          <View className="items-start gap-1">
            <View className="h-3 w-16 rounded-md bg-slate-200" />
            <View className="h-5 w-28 rounded-md bg-slate-200" />
          </View>
        </View>

        {/* Left: icon placeholders */}
        <View className="flex-row items-center gap-3">
          <View className="h-6 w-6 rounded-full bg-slate-200" />
          <View className="h-6 w-6 rounded-full bg-slate-200" />
        </View>
      </View>

      {/* ── 2. Search Bar ── */}
      <View className="mb-6 flex-row items-center gap-3">
        <View className="h-[45px] flex-1 rounded-full bg-slate-100" />
        <View className="h-[45px] w-[45px] rounded-full bg-slate-100" />
      </View>

      {/* ── 3. Primary Tabs ── */}
      <View className="mb-4 flex-row items-center border-b border-gray-200 pb-3">
        <View className="flex-1 items-center">
          <View className="h-4 w-14 rounded-md bg-slate-200" />
        </View>
        <View className="flex-1 items-center">
          <View className="h-4 w-14 rounded-md bg-slate-100" />
        </View>
        <View className="flex-1 items-center">
          <View className="h-4 w-14 rounded-md bg-slate-100" />
        </View>
      </View>

      {/* ── 4. Filter Pills Row ── */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1 rounded-xl bg-slate-50 p-1">
          <View className="h-8 w-9 rounded-lg bg-slate-200" />
          <View className="h-8 w-9 rounded-lg bg-slate-100" />
        </View>
      </View>
    </View>
  );
}

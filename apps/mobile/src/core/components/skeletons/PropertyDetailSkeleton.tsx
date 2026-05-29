import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 350;

export default function PropertyDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      {/* 1. Media Header Skeleton */}
      <View
        style={{
          height: HEADER_HEIGHT,
          width: '100%',
          position: 'relative',
          backgroundColor: '#E2E8F0',
        }}
      >
        {/* Header Action Buttons */}
        <View
          className="absolute top-0 z-10 w-full flex-row justify-between px-5"
          style={{
            paddingTop: Math.max(insets.top, 20) + 10,
          }}
        >
          {/* Right Action: Back Button Placeholder */}
          <View
            style={{
              height: 32,
              width: 32,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: 8,
            }}
          />
          {/* Left Actions: Share & Heart Placeholders */}
          <View className="flex-row gap-3">
            <View className="h-10 w-10 rounded-xl bg-white/80" />
            <View className="h-10 w-10 rounded-xl bg-white/80" />
          </View>
        </View>

        {/* Carousel Indicator Placeholder */}
        <View className="absolute bottom-6 w-full flex-row items-center justify-center gap-1.5">
          <View className="h-2 w-6 rounded-full bg-white/80" />
          <View className="h-2 w-2 rounded-full bg-white/40" />
          <View className="h-2 w-2 rounded-full bg-white/40" />
        </View>
      </View>

      {/* 2. Scrollable Content Placeholders */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Property Overview Placeholder */}
        <View className="bg-white px-5 pt-5">
          {/* Title & Price / Badges & Meta */}
          <View className="flex-row items-start justify-between">
            {/* Title & Price Column (RTL Right side) */}
            <View className="mr-4 flex-1 items-start gap-2">
              <View className="h-5 w-40 rounded-md bg-slate-200" />
              <View className="h-7 w-28 rounded-md bg-slate-200" />
            </View>
            {/* Badges & Meta Column (RTL Left side) */}
            <View className="mb-3 items-end gap-3">
              <View className="h-5 w-16 rounded-md bg-slate-200" />
              <View className="h-4 w-20 rounded-md bg-slate-100" />
            </View>
          </View>

          {/* Specs Row */}
          <View className="my-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <View className="h-4 w-4 rounded bg-slate-200" />
              <View className="h-4 w-12 rounded bg-slate-200" />
            </View>
            <View className="mx-4 h-4 w-[1px] bg-gray-200" />
            <View className="flex-row items-center gap-1.5">
              <View className="h-4.5 w-4.5 rounded bg-slate-200" />
              <View className="h-4 w-12 rounded bg-slate-200" />
            </View>
            <View className="mx-4 h-4 w-[1px] bg-gray-200" />
            <View className="flex-row items-center gap-1.5">
              <View className="h-4 w-4 rounded bg-slate-200" />
              <View className="h-4 w-12 rounded bg-slate-200" />
            </View>
          </View>

          {/* Area & Location */}
          <View className="space-y-2">
            <View className="mb-2 flex-row items-center gap-1.5">
              <View className="h-4 w-4 rounded bg-slate-200" />
              <View className="h-4 w-24 rounded bg-slate-200" />
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-4.5 w-4 rounded bg-slate-200" />
              <View className="h-4 w-3/4 rounded bg-slate-200" />
            </View>
          </View>
        </View>

        {/* Card 2: Map Preview Placeholder */}
        <View className="mt-4 px-5">
          <View className="h-32 w-full items-center justify-center rounded-xl bg-slate-100">
            <View className="h-10 w-36 rounded-full bg-white shadow-sm" />
          </View>
        </View>

        {/* Card 3: Property Details Body Placeholder */}
        <View className="mt-4 px-5">
          {/* Features Section */}
          <View className="mb-6">
            <View className="mb-3 h-4 w-20 rounded bg-slate-200" />
            <View className="flex-row items-center gap-2">
              <View className="h-5 w-16 rounded bg-slate-100" />
              <View className="mx-1 h-4 w-[1px] bg-slate-200" />
              <View className="h-5 w-14 rounded bg-slate-100" />
              <View className="mx-1 h-4 w-[1px] bg-slate-200" />
              <View className="h-5 w-14 rounded bg-slate-100" />
            </View>
          </View>

          {/* Description Section */}
          <View className="mb-6">
            <View className="mb-3 h-4 w-16 rounded bg-slate-200" />
            <View className="space-y-2">
              <View className="h-4 w-full rounded bg-slate-100" />
              <View className="h-4 w-full rounded bg-slate-100" />
              <View className="h-4 w-5/6 rounded bg-slate-100" />
            </View>
          </View>
        </View>

        {/* Card 4: Lister Profile Snippet Placeholder */}
        <View className="mt-4 px-5">
          <View className="mb-6 flex-row items-center justify-between rounded-md bg-[#F9FAFE] p-4">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-14 w-14 rounded-full bg-slate-200" />
              <View className="items-start gap-1.5">
                <View className="h-5 w-24 rounded bg-slate-200" />
                <View className="h-4 w-36 rounded bg-slate-100" />
              </View>
            </View>
            <View className="items-end justify-center gap-2">
              <View className="h-4 w-10 rounded bg-slate-200" />
              <View className="h-5 w-5 rounded bg-slate-100" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 3. Bottom Action Bar Placeholder */}
      <View
        className="absolute bottom-0 w-full flex-row items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 pt-3 shadow-lg"
        style={{
          paddingBottom: Math.max(insets.bottom, 20),
        }}
      >
        <View className="h-10 flex-1 rounded-[24px] border border-[#15304D]/20 bg-slate-50" />
        <View className="h-10 flex-1 rounded-[24px] border border-[#60D669]/20 bg-slate-50" />
        <View className="h-10 flex-1 rounded-[24px] border border-[#B28648]/20 bg-slate-50" />
      </View>
    </View>
  );
}

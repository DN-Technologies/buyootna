import React from 'react';
import { DimensionValue, View } from 'react-native';

interface SuggestionCardSkeletonProps {
  cardWidth?: DimensionValue;
}

export default function SuggestionCardSkeleton({
  cardWidth = '100%',
}: SuggestionCardSkeletonProps) {
  return (
    <View
      className="mb-4 w-full flex-row items-center border border-gray-100"
      style={{
        width: cardWidth,
        borderRadius: 4,
        padding: 12,
        gap: 10,
        backgroundColor: '#FEFEFE',
        elevation: 2,
        shadowColor: '#919191',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      }}
    >
      {/* 1. Image Box Placeholder */}
      <View className="h-[88px] w-[64px] rounded-sm bg-slate-200" />

      {/* 2. Content Column Placeholder */}
      <View className="flex-1 justify-between">
        {/* Top Row: Title & Category (right) and Heart Icon (left) */}
        <View className="mb-3 flex-row items-start justify-between">
          {/* Title & Category Placeholders */}
          <View className="flex-1 items-end pr-1">
            {/* Name placeholder */}
            <View className="h-5 w-32 rounded-md bg-slate-200" />
            {/* Category placeholder */}
            <View className="mt-2 h-3.5 w-24 rounded-md bg-slate-100" />
          </View>

          {/* Heart Icon placeholder */}
          <View className="h-10 w-10 items-center justify-center">
            <View className="h-6 w-6 rounded-full bg-slate-200" />
          </View>
        </View>

        {/* Bottom Row: Stats Placeholders */}
        <View className="flex-row items-center justify-between px-1">
          <View className="w-full flex-row gap-4">
            {/* Service Area Column */}
            <View className="items-start">
              <View className="h-4 w-12 rounded-md bg-slate-200" />
              <View className="mt-1 h-3 w-8 rounded-md bg-slate-100" />
            </View>

            {/* Vertical Divider */}
            <View className="flex-1 items-center justify-center">
              <View className="mx-2 h-8 w-[1px] max-w-[1px] bg-[#E2E8F0]" />
            </View>

            {/* Projects Count Column */}
            <View className="items-end">
              <View className="items-start">
                <View className="h-4 w-8 rounded-md bg-slate-200" />
                <View className="mt-1 h-3 w-16 rounded-md bg-slate-100" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

import React from 'react';
import { DimensionValue, View } from 'react-native';

interface CompanySkeletonProps {
  cardWidth?: DimensionValue;
}

export default function CompanySkeleton({ cardWidth = '100%' }: CompanySkeletonProps) {
  return (
    <View
      className="mb-4 rounded-sm border border-gray-100 bg-white p-4"
      style={{
        width: cardWidth,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
    >
      {/* --- 1. Top Section: Header --- */}
      <View className="mb-4 flex-row items-start justify-between">
        {/* Top Right: Logo & Info */}
        <View className="mr-3 flex-1 flex-row">
          {/* Logo Box Placeholder */}
          <View className="h-16 w-16 rounded-sm bg-slate-200" />

          {/* Info Placeholders */}
          <View className="ml-3 mr-1 flex-1">
            {/* Company Name Placeholder */}
            <View className="h-5 w-32 rounded-md bg-slate-200" />
            {/* Category Placeholder */}
            <View className="mt-2 h-3.5 w-48 rounded-md bg-slate-100" />
          </View>
        </View>

        {/* Top Left: Rating Placeholder */}
        <View className="mt-1 flex-row items-center gap-1">
          <View className="h-4 w-4 rounded-full bg-slate-200" />
          <View className="h-4 w-6 rounded-md bg-slate-100" />
        </View>
      </View>

      {/* --- 2. Middle Section: Stats --- */}
      <View className="mb-4 flex-row items-center justify-between px-1">
        <View className="w-full flex-row gap-4 pr-2">
          {/* Service Area Column */}
          <View className="items-start">
            <View className="h-4 w-20 rounded-md bg-slate-200" />
            <View className="mt-1 h-3 w-10 rounded-md bg-slate-100" />
          </View>

          {/* Divider */}
          <View className="flex-1 items-center justify-center">
            <View className="mx-2 h-8 w-[1px] bg-slate-100" />
          </View>

          {/* Projects Count Column */}
          <View className="items-end">
            <View className="items-start">
              <View className="h-4 w-12 rounded-md bg-slate-200" />
              <View className="mt-1 h-3 w-20 rounded-md bg-slate-100" />
            </View>
          </View>
        </View>
      </View>

      {/* --- 3. Bottom Section: Action Button --- */}
      <View className="flex-row items-center gap-3">
        {/* Button Placeholder */}
        <View className="h-10 flex-1 rounded-[24px] bg-slate-200" />
        {/* Favorite Heart Placeholder */}
        <View className="h-10 w-10 rounded-full bg-slate-100" />
      </View>
    </View>
  );
}

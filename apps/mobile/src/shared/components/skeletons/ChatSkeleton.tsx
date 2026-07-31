import React from 'react';
import { View } from 'react-native';

export function ChatItemSkeleton() {
  return (
    <View className="flex-row items-center gap-3 border-b border-gray-50 bg-white px-5 py-4">
      {/* Right: Avatar Placeholder */}
      <View className="h-14 w-14 rounded-full bg-slate-200" />

      {/* Middle: Content Placeholder */}
      <View className="flex-1 items-start justify-center pr-3">
        {/* Name */}
        <View className="mb-2 h-4 w-32 rounded-md bg-slate-200" />
        {/* Property Context */}
        <View className="mb-2 h-3 w-24 rounded-md bg-slate-100" />
        {/* Last Message */}
        <View className="h-3.5 w-44 rounded-md bg-slate-100" />
      </View>

      {/* Left: Timestamp Placeholder */}
      <View className="h-12 items-end justify-start">
        <View className="h-3 w-12 rounded-md bg-slate-100" />
      </View>
    </View>
  );
}

export default function ChatListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="flex-1 bg-white">
      {Array.from({ length: count }).map((_, index) => (
        <ChatItemSkeleton key={index} />
      ))}
    </View>
  );
}

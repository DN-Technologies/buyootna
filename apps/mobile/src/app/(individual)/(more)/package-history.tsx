import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/shared/api/api';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface HistoryItem {
  id: string;
  displayId: string;
  planName: string;
  planSlug: string;
  status: 'ACTIVE' | 'EXPIRED';
  dateText: string;
  createdAt: string;
}

export default function PackageHistoryScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await apiClient.get('/plans/history');
      if (res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      console.log('Error fetching package history:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) => {
    if (filterActive === true) return item.status === 'ACTIVE';
    if (filterActive === false) return item.status === 'EXPIRED';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* 1. Header */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          سجل الاعلانات
        </Text>
        <View className="w-8" />
      </View>

      {/* 2. Filter & Sort Bar */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-3">
        {/* Sort Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5"
        >
          <Feather name="sliders" size={16} color="#6B6A6A" />
          <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
            الترتيب حسب
          </Text>
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (filterActive === null) setFilterActive(true);
            else if (filterActive === true) setFilterActive(false);
            else setFilterActive(null);
          }}
          className="flex-row items-center gap-1.5"
        >
          <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
            تصفية
          </Text>
          <Feather name="filter" size={16} color="#6B6A6A" />
        </TouchableOpacity>
      </View>

      {/* 3. History Items List */}
      {isLoading ? (
        <View className="p-5">
          {[1, 2, 3, 4].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} showTrailing />
          ))}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#15304D']}
            />
          }
        >
          {filteredHistory.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Feather name="package" size={48} color="#94A3B8" />
              <Text className="mt-3 font-cairo-semibold text-base text-[#6B6A6A]">
                لا يوجد سجل إعلانات حالياً
              </Text>
            </View>
          ) : (
            filteredHistory.map((item) => (
              <View
                key={item.id}
                className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F8F9FA] p-4"
              >
                {/* Left side: Display ID */}
                <Text className="font-cairo text-xs text-[#94A3B8]">
                  {item.displayId}
                </Text>

                {/* Right side: Title & Expiry */}
                <View className="items-end">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-cairo-semibold text-sm text-[#111111]">
                      {item.planName}
                    </Text>
                    <View
                      className={`h-2 w-2 rounded-full ${
                        item.status === 'ACTIVE'
                          ? 'bg-[#10B981]'
                          : 'bg-[#EF4444]'
                      }`}
                    />
                  </View>
                  <Text className="mt-1 font-cairo text-xs text-[#6B6A6A]">
                    {item.dateText}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

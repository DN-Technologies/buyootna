import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ContentContainer from '@/shared/components/ContentContainer';

type RequestFilter = 'all' | 'pending' | 'accepted' | 'completed';

export default function CompanyRequestsScreen() {
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('all');

  const filters: { key: RequestFilter; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'قيد الانتظار' },
    { key: 'accepted', label: 'مقبولة' },
    { key: 'completed', label: 'مكتملة' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F5F6FA]">
      {/* Header */}
      <View className="bg-white px-5 py-4">
        <Text
          className="font-cairo-bold text-lg text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          الطلبات
        </Text>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 8,
          flexDirection: 'row-reverse',
        }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            className={`rounded-full px-5 py-2 ${
              activeFilter === filter.key
                ? 'bg-[#15304D]'
                : 'border border-gray-200 bg-white'
            }`}
          >
            <Text
              className={`font-cairo-semibold text-sm ${
                activeFilter === filter.key
                  ? 'text-white'
                  : 'text-[#6B6A6A]'
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <ContentContainer>
          {/* Empty State */}
          <View className="mx-4 mt-8 items-center rounded-2xl bg-white py-16">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#F0F4FF]">
              <Feather name="inbox" size={36} color="#94A3B8" />
            </View>
            <Text className="font-cairo-bold text-base text-[#111111]">
              لا توجد طلبات
            </Text>
            <Text className="mt-1 font-cairo-medium text-sm text-[#6B6A6A]">
              ستظهر طلبات العملاء الواردة هنا
            </Text>
          </View>
        </ContentContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

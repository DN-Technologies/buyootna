import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { faqService } from '@/shared/api/faq.service';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQScreen() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const data = await faqService.getFAQs();
      setFaqs(data);
    } catch (e) {
      console.error('Failed to load FAQs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-bold text-lg text-[#111111]">
          الأسئلة الشائعة
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View>
            {[1, 2, 3, 4].map((key) => (
              <ListRowSkeleton key={key} showIcon={false} />
            ))}
          </View>
        ) : (
          faqs.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View
                key={item.id}
                className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-[#F9FAFE] p-4"
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleExpand(item.id)}
                  className="flex-row items-center justify-between"
                >
                  <Text
                    className="ml-3 flex-1 font-cairo-bold text-[14px] text-[#15304D]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {item.question}
                  </Text>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#15304D"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View className="mt-3 border-t border-gray-100 pt-3">
                    <Text
                      className="font-cairo-medium text-[13px] leading-6 text-[#6B6A6A]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

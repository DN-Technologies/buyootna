import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'ما هو تطبيق بيوتنا؟',
    answer:
      'تطبيق بيوتنا هو منصة عقارية كويتية متخصصة تهدف لتسهيل عملية البحث، البيع، الإيجار، والبدل لمختلف فئات العقارات في الكويت.',
  },
  {
    id: '2',
    question: 'كيف يمكنني إضافة إعلان جديد؟',
    answer:
      'يمكنك إضافة إعلان بالضغط على زر (+) في القائمة السفلية، ثم ملء تفاصيل العقار كالموقع والمساحة والسعر وإرفاق الصور المطلوبة ونشره مباشرة.',
  },
  {
    id: '3',
    question: 'هل توجد عمولات على عمليات البيع أو الإيجار؟',
    answer:
      'لا، تطبيق بيوتنا منصة مجانية للإعلان العقاري ولا يتقاضى أي عمولة على الصفقات المبرمة بين البائع والمشتري.',
  },
  {
    id: '4',
    question: 'ما هي باقات الإعلانات المميزة؟',
    answer:
      'توفر باقات الإعلانات المميزة ظهوراً أكبر لإعلانك في أعلى نتائج البحث وواجهة التطبيق الرئيسية لزيادة فرص الاتصال والمشاهدات.',
  },
  {
    id: '5',
    question: 'كيف يمكنني التواصل مع صاحب العقار؟',
    answer:
      'يمكنك التواصل مباشرة مع صاحب الإعلان من خلال صفحة تفاصيل العقار بالضغط على أزرار الاتصال الهاتفي، أو الواتساب، أو عبر المحادثة المباشرة المدمجة بالتطبيق.',
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        {FAQ_DATA.map((item) => {
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
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#15304D"
                />
                <Text
                  className="ml-3 flex-1 text-right font-cairo-bold text-[14px] text-[#15304D]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {item.question}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <View className="mt-3 border-t border-gray-100 pt-3">
                  <Text
                    className="text-right font-cairo-medium text-[13px] leading-6 text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

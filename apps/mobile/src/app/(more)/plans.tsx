import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlansScreen() {
  const router = useRouter();

  const plans = [
    {
      id: 'regular',
      name: 'العادية',
      price: '0 دينار كويتي',
      features: [
        'اعلان واحد نشط.',
        'مدة النشر 10 ايام.',
        'حتى 5 صورة للعقار.',
        'ظهور في نتائج البحث.',
        'تواصل مباشر مع المهتمين.',
      ],
      color: '#15304D',
      badge: '',
    },
    {
      id: 'silver',
      name: 'الفضية',
      price: '5 دينار كويتي',
      features: [
        'اعلان واحد نشط.',
        'مدة النشر 45 يوم.',
        'حتى 10 صورة للعقار.',
        'تثبيت 5 ايام في نتائج البحث.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
      color: '#15304D',
      badge: '',
    },
    {
      id: 'gold',
      name: 'الذهبية',
      price: '10 دينار كويتي',
      originalPrice: '20',
      discountText: 'خصم 50%',
      features: [
        '4 اعلانات نشطة في نفس الوقت.',
        'مدة النشر 60 يوم.',
        'حتى 15 صورة للعقار.',
        'تثبيت 7 ايام في نتائج البحث.',
        'اولوية الظهور في البحث الجغرافي.',
      ],
      color: '#15304D',
      badge: 'موصى به',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-8"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الباقات
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Plan Cards */}
          <View className="gap-6">
            {plans.map((plan) => (
              <View
                key={plan.id}
                className={`relative rounded-2xl border bg-white p-5 shadow-sm shadow-gray-200/50 ${
                  plan.id === 'gold' ? 'border-[#D06400]' : 'border-[#ECECEC]'
                }`}
              >
                {/* Centered Top Badge */}
                {plan.badge ? (
                  <View className="absolute -top-[14.5px] left-0 right-0 items-center">
                    <LinearGradient
                      colors={['#FF8D28', '#FACC15']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        borderRadius: 22,
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        height: 29,
                        width: 111,
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Feather name="award" size={12} color="#111111" />
                      <Text className="font-cairo-semibold text-[12px] leading-[20px] text-[#111111]">
                        {plan.badge}
                      </Text>
                    </LinearGradient>
                  </View>
                ) : null}

                {/* Main Info */}
                <View className="mt-2 items-start">
                  <Text className="mb-1 font-cairo-semibold text-base text-[#111111]">
                    {plan.name}
                  </Text>
                  <View className="mb-4 flex-row items-baseline gap-2">
                    <Text className="font-cairo-bold text-lg text-[#111111]">
                      {plan.price}
                    </Text>
                    {plan.originalPrice && (
                      <Text className="font-cairo text-lg text-[#6B6A6A] line-through">
                        {plan.originalPrice}
                      </Text>
                    )}
                    {plan.discountText && (
                      <Text className="font-cairo text-lg text-[#018B1B]">
                        {plan.discountText}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Divider */}
                <View className="my-4 h-[1px] bg-gray-100" />

                {/* Features List */}
                <View className="mb-6 gap-2">
                  {plan.features.map((feat, idx) => (
                    <View key={idx} className="flex-row items-center gap-2">
                      <Feather name="check" size={16} color="#018B1B" />
                      <Text
                        className="flex-1 font-cairo text-sm text-[#111111]"
                        style={{ writingDirection: 'rtl' }}
                      >
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Buy Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => console.log(`Buy ${plan.name}`)}
                  className="h-12 w-full items-center justify-center rounded-[24px]"
                  style={{ backgroundColor: '#15304D' }}
                >
                  <Text className="font-cairo-semibold text-[14px] text-white">
                    اشتر الآن
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

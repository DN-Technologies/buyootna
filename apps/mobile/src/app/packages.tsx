import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PackagesScreen() {
  const router = useRouter();

  const packages = [
    {
      id: 'silver',
      name: 'الباقة الفضية',
      price: '15 د.ك',
      duration: '30 يوم',
      features: ['5 إعلانات عادية', 'إعلان واحد مميز', 'دعم فني متواصل', 'إحصائيات أساسية للمشاهدات'],
      color: '#475569',
      badge: 'الأكثر شعبية',
    },
    {
      id: 'gold',
      name: 'الباقة الذهبية',
      price: '35 د.ك',
      duration: '60 يوم',
      features: ['15 إعلان عادي', '3 إعلانات مميزة', 'لوحة تحكم احترافية', 'دعم فني ذو أولوية', 'إحصائيات متقدمة للمشاهدات'],
      color: '#D4AF37',
      badge: 'أفضل قيمة',
    },
    {
      id: 'diamond',
      name: 'الباقة الماسية',
      price: '75 د.ك',
      duration: '90 يوم',
      features: ['إعلانات غير محدودة', '10 إعلانات مميزة', 'تثبيت الإعلانات في الصفحة الأولى', 'مدير حساب مخصص', 'تقارير أداء تفصيلية'],
      color: '#0284C7',
      badge: 'للشركات والمكاتب',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Feather name="arrow-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111]">باقات الإعلانات</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Header Text */}
          <Text className="text-right font-cairo-bold text-2xl text-[#15304D] mb-2">
            رقي حسابك وانشر المزيد من العقارات
          </Text>
          <Text className="text-right font-cairo-medium text-sm text-[#6B6A6A] mb-8 leading-6">
            اختر الباقة المناسبة لاحتياجاتك وابدأ في الترويج لعقاراتك وخدماتك للوصول إلى جمهور أكبر.
          </Text>

          {/* Package Cards */}
          <View className="gap-6">
            {packages.map((pkg) => (
              <View
                key={pkg.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-200/50 relative overflow-hidden"
              >
                {/* Badge */}
                <View
                  className="absolute left-0 top-0 rounded-br-xl px-3 py-1"
                  style={{ backgroundColor: pkg.color }}
                >
                  <Text className="font-cairo-bold text-[10px] text-white">
                    {pkg.badge}
                  </Text>
                </View>

                {/* Main Info */}
                <View className="items-end mt-2">
                  <Text className="font-cairo-bold text-xl text-[#111111] mb-1">
                    {pkg.name}
                  </Text>
                  <View className="flex-row items-baseline gap-1 mb-4">
                    <Text className="font-cairo-bold text-3xl" style={{ color: pkg.color }}>
                      {pkg.price}
                    </Text>
                    <Text className="font-cairo text-xs text-[#6B6A6A]">
                      / {pkg.duration}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-gray-100 my-4" />

                {/* Features List */}
                <View className="gap-2 mb-6">
                  {pkg.features.map((feat, idx) => (
                    <View key={idx} className="flex-row items-center justify-end gap-2">
                      <Text className="text-right font-cairo text-sm text-[#6B6A6A] flex-1">
                        {feat}
                      </Text>
                      <Feather name="check" size={16} color={pkg.color} />
                    </View>
                  ))}
                </View>

                {/* Buy Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => console.log(`Buy ${pkg.name}`)}
                  className="w-full h-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#15304D' }}
                >
                  <Text className="font-cairo-bold text-[15px] text-white">
                    اشترك الآن
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

import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import PropertyCard from '@/core/components/PropertyCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_CARD_WIDTH = SCREEN_WIDTH * 0.75;

const SectionHeader = ({ title }: { title: string }) => (
  <View className="mb-3 mt-6 flex-row items-center justify-between px-5">
    <TouchableOpacity activeOpacity={0.7}>
      <Text className="font-cairo-bold text-sm text-[#15304D]">عرض الكل</Text>
    </TouchableOpacity>
    <Text className="font-cairo-bold text-lg text-[#111111]">{title}</Text>
  </View>
);

export default function RentProperties() {
  return (
    <View>
      <SectionHeader title="عقارات للايجار" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <View className="mr-4">
          <PropertyCard
            id="3"
            images={[
              'https://images.unsplash.com/photo-1600607687931-ce8309e0fb73?auto=format&fit=crop&w=800&q=80',
            ]}
            price={450}
            companyName="السعر غير معلن"
            isFeatured={true}
            type="سكني"
            area={120}
            beds={2}
            baths={2}
            location="الجابرية، قطعة 4"
            cardWidth={HORIZONTAL_CARD_WIDTH}
          />
        </View>
        <View>
          <PropertyCard
            id="4"
            images={[
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
            ]}
            price={600}
            companyName="الدار العقارية"
            isFeatured={false}
            type="تجاري"
            area={150}
            beds={0}
            baths={1}
            location="شرق، شارع احمد الجابر"
            cardWidth={HORIZONTAL_CARD_WIDTH}
          />
        </View>
      </ScrollView>
    </View>
  );
}

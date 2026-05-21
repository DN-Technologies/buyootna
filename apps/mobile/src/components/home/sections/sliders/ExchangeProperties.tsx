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

export default function ExchangeProperties() {
  return (
    <View>
      <SectionHeader title="عقارات للبدل" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <View>
          <PropertyCard
            id="5"
            images={[
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
            ]}
            price={150000}
            companyName="شركة يعقوب عبد العقارية"
            isFeatured={true}
            type="سكني"
            area={200}
            beds={3}
            baths={2}
            location="السالمية، شارع 2، بناية 10، شقة 4"
            cardWidth={HORIZONTAL_CARD_WIDTH}
          />
        </View>
      </ScrollView>
    </View>
  );
}

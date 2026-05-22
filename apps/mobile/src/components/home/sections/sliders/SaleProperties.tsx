import React from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MOCK_PROPERTIES_DATA } from '@/assets/mock/propertiesData';
import PropertyCard from '@/core/components/PropertyCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_CARD_WIDTH = SCREEN_WIDTH * 0.75;

const SectionHeader = ({ title }: { title: string }) => (
  <View className="mb-3 mt-1 flex-row items-center justify-between px-5">
    <Text className="font-cairo-bold text-lg text-[#111111]">{title}</Text>
    <TouchableOpacity activeOpacity={0.7}>
      <Text className="font-cairo-semibold text-sm text-[#15304D]">
        عرض الكل
      </Text>
    </TouchableOpacity>
  </View>
);

export default function SaleProperties() {
  const saleProperties = MOCK_PROPERTIES_DATA.filter((p) => p.category === 'sale').slice(0, 6);

  return (
    <View>
      <SectionHeader title="عقارات للبيع" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {saleProperties.map((property, index) => (
          <View
            key={property.id}
            className={index < saleProperties.length - 1 ? 'mr-4' : ''}
          >
            <PropertyCard
              id={property.id}
              images={property.images}
              price={property.price}
              companyName={property.companyName}
              isFeatured={property.isFeatured}
              type={property.type}
              area={property.area}
              beds={property.beds}
              baths={property.baths}
              location={property.location}
              cardWidth={HORIZONTAL_CARD_WIDTH}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}


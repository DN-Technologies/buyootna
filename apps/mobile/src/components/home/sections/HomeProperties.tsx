import React from 'react';
import { View } from 'react-native';

import { MOCK_PROPERTIES_DATA } from '@/assets/mock/propertiesData';
import PropertyCard from '@/core/components/PropertyCard';

interface HomePropertiesProps {
  activeFilter?: 'all' | 'sale' | 'rent' | 'exchange';
}

export default function HomeProperties({ activeFilter = 'all' }: HomePropertiesProps) {
  const filteredProperties = MOCK_PROPERTIES_DATA.filter(
    (item) => activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <View className="px-5">
      {filteredProperties.map((property) => (
        <PropertyCard
          key={property.id}
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
          timeAgo={property.timeAgo}
        />
      ))}
    </View>
  );
}


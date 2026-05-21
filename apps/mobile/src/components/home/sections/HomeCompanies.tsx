import React from 'react';
import { View } from 'react-native';

import ServiceCompanies from './sliders/ServiceCompanies';

interface HomeCompaniesProps {
  activeFilter?: 'all' | 'finishing' | 'transport' | 'building' | 'other';
}

export default function HomeCompanies({ activeFilter = 'all' }: HomeCompaniesProps) {
  return (
    <View>
      <ServiceCompanies activeFilter={activeFilter} />
    </View>
  );
}

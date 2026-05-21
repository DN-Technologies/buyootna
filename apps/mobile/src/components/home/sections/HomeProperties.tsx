import React from 'react';
import { View } from 'react-native';

import ExchangeProperties from './sliders/ExchangeProperties';
import RentProperties from './sliders/RentProperties';
import SaleProperties from './sliders/SaleProperties';

interface HomePropertiesProps {
  activeFilter?: 'all' | 'sale' | 'rent' | 'exchange';
}

export default function HomeProperties({ activeFilter = 'all' }: HomePropertiesProps) {
  const showSale = activeFilter === 'all' || activeFilter === 'sale';
  const showRent = activeFilter === 'all' || activeFilter === 'rent';
  const showExchange = activeFilter === 'all' || activeFilter === 'exchange';

  return (
    <View>
      {/* --- Section: عقارات للبيع (Properties for Sale) --- */}
      {showSale && <SaleProperties />}

      {/* --- Section: عقارات للايجار (Properties for Rent) --- */}
      {showRent && <RentProperties />}

      {/* --- Section: عقارات للبدل (Properties for Exchange) --- */}
      {showExchange && <ExchangeProperties />}
    </View>
  );
}


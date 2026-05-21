import React from 'react';
import { View } from 'react-native';

import ExchangeProperties from './sliders/ExchangeProperties';
import RentProperties from './sliders/RentProperties';
import SaleProperties from './sliders/SaleProperties';
import ServiceCompanies from './sliders/ServiceCompanies';

export default function HomeAll() {
  return (
    <View>
      {/* --- Section: عقارات للبيع (Properties for Sale) --- */}
      <SaleProperties />

      {/* --- Section: عقارات للايجار (Properties for Rent) --- */}
      <RentProperties />

      {/* --- Section: عقارات للبدل (Properties for Exchange) --- */}
      <ExchangeProperties />

      {/* --- Section: شركات الخدمات (Service Companies) --- */}
      <ServiceCompanies />
    </View>
  );
}

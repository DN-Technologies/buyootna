import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeFilterPills from '@/components/home/HomeFilterPills';
import HomeHeader from '@/components/home/HomeHeader';
import HomePrimaryTabs from '@/components/home/HomePrimaryTabs';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import HomeAll from '@/components/home/sections/HomeAll';
import HomeCompanies from '@/components/home/sections/HomeCompanies';
import HomeProperties from '@/components/home/sections/HomeProperties';

type PrimaryTab = 'all' | 'properties' | 'companies';
type PropertyFilter = 'all' | 'sale' | 'rent' | 'exchange';
type CompanyFilter =
  | 'all'
  | 'finishing'
  | 'transport'
  | 'building'
  | 'decorations'
  | 'interior_design'
  | 'other';

export default function HomeScreen() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<PrimaryTab>('all');
  const [activePropFilter, setActivePropFilter] =
    useState<PropertyFilter>('all');
  const [activeCompFilter, setActiveCompFilter] =
    useState<CompanyFilter>('all');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="px-5 pt-4">
        {/* 1. Header Section */}
        <HomeHeader />

        {/* 2. Search Bar */}
        <HomeSearchBar />

        {/* 3. Primary Tabs (الجميع | عقارات | شركات) */}
        <HomePrimaryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 4. Secondary Tabs (Filter Pills) */}
        <HomeFilterPills
          activeTab={activeTab}
          activePropFilter={activePropFilter}
          onPropFilterChange={setActivePropFilter}
          activeCompFilter={activeCompFilter}
          onCompFilterChange={setActiveCompFilter}
        />
      </View>

      {/* 5. Scrolling Content Area (The Feed) */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 130,
        }} // Extra padding for the custom bottom bar
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'all' && <HomeAll />}
        {activeTab === 'properties' && (
          <HomeProperties activeFilter={activePropFilter} />
        )}
        {activeTab === 'companies' && (
          <HomeCompanies activeFilter={activeCompFilter} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import ExchangePropertyTab from '@/core/components/filters/tabs/ExchangePropertyTab';
import StandardPropertyTab from '@/core/components/filters/tabs/StandardPropertyTab';

// Define the valid tabs
export type FilterTab =
  | 'sell'
  | 'rent'
  | 'exchange'
  | 'companies'
  | 'auctions'
  | 'deals';

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'sell', label: 'بيع' },
  { id: 'rent', label: 'ايجار' },
  { id: 'exchange', label: 'بدل' },
  { id: 'companies', label: 'شركات' },
  { id: 'auctions', label: 'مزادات' },
  { id: 'deals', label: 'صفقات' },
];

interface GlobalFilterSheetProps {
  onClose?: () => void;
}

const GlobalFilterSheet = forwardRef<BottomSheetModal, GlobalFilterSheetProps>(
  ({ onClose }, ref) => {
    // --- State ---
    const [activeTab, setActiveTab] = useState<FilterTab>('sell'); // Default to Sell

    // --- Bottom Sheet Configuration ---
    // Snap points dictate how high hte sheet opens. 90% gives a nice full-screen feel while leaving a gap at the top.
    const snapPoints = useMemo(() => ['90%'], []);

    // Backdrop renders the dark overlay behind the sheet
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        // @ts-ignore
        ref.current.dismiss();
      }
      if (onClose) onClose();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        // Customize the drag handle pill to match the design
        handleIndicatorStyle={{
          backgroundColor: '#D1D5DB',
          width: 40,
          height: 4,
        }}
      >
        <BottomSheetView style={{ flex: 1 }} className="bg-white">
          {/* --- 1. Static Header --- */}
          <View className="flex-row items-center justify-between px-5 pb-4 pt-2">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              تصفية البحث
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-50"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* --- 2. Scrollable Tab Navigation --- */}
          <View className="border-b border-gray-100">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    activeOpacity={0.7}
                    onPress={() => setActiveTab(tab.id)}
                    className="relative items-center px-4 pb-3 pt-1"
                  >
                    <Text
                      className={`text-[15px] leading-[22px] tracking-[-0.41px] ${isActive ? 'font-almarai-bold text-[#15304D]' : 'font-almarai text-[#6B6A6A]'}`}
                    >
                      {tab.label}
                    </Text>

                    {/* Active Underline Indicator */}
                    {isActive && (
                      <View className="absolute bottom-0 h-[2.5px] w-full min-w-[50px] rounded-t-full bg-[#15304D]" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* --- 3. Dynamic Content Area --- */}
          <View className="flex-1">
            {activeTab === 'sell' && <StandardPropertyTab type="sell" />}
            {activeTab === 'rent' && <StandardPropertyTab type="rent" />}
            {activeTab === 'exchange' && <ExchangePropertyTab />}

            {/* Placeholders for upcoming cards */}

            {activeTab === 'companies' && (
              <View className="flex-1 items-center justify-center">
                <Text>شركات</Text>
              </View>
            )}
            {activeTab === 'auctions' && (
              <View className="flex-1 items-center justify-center">
                <Text>مزادات</Text>
              </View>
            )}
            {activeTab === 'deals' && (
              <View className="flex-1 items-center justify-center">
                <Text>صفقات</Text>
              </View>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

GlobalFilterSheet.displayName = 'GlobalFilterSheet';

export default GlobalFilterSheet;

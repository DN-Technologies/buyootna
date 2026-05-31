import { Feather } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface SelectionItem {
  id: string;
  label: string;
}

export interface SelectionDrawerProps {
  title: string;
  data: SelectionItem[];
  onSelect: (item: SelectionItem) => void;
}

const SelectionDrawer = forwardRef<BottomSheetModal, SelectionDrawerProps>(
  ({ title, data, onSelect }, ref) => {
    // --- State ---
    const [searchText, setSearchText] = useState('');

    // --- Bottom Sheet Configuration ---
    // Opens to 95% of the screen so it feels like a full drawer but retains context
    const snapPoints = useMemo(() => ['95%'], []);

    // Dark backdrop behind this specific modal
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
        />
      ),
      [],
    );

    const handleClose = () => {
      // @ts-ignore
      ref.current?.dismiss();
      setSearchText(''); // Reset search when closed
      Keyboard.dismiss();
    };

    const handleSelect = (item: SelectionItem) => {
      onSelect(item);
      handleClose();
    };

    // --- Search Filter Logic ---
    const filteredData = useMemo(() => {
      if (!searchText.trim()) return data;
      return data.filter((item) => item.label.includes(searchText));
    }, [searchText, data]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: '#D1D5DB',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ borderRadius: 24 }}
        keyboardBehavior="extend" // Keeps the sheet stable when keyboard opens
      >
        <View className="flex-1 bg-white">
          {/* --- 1. Header --- */}
          <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-4 pt-2">
            <TouchableOpacity onPress={handleClose} className="-ml-2 p-2">
              <Feather name="chevron-left" size={24} color="#111111" />
            </TouchableOpacity>
            <Text className="font-cairo-bold text-lg text-[#111111]">
              {title}
            </Text>
            {/* Centering placeholder */}
            <View className="w-8" />
          </View>

          {/* --- 2. Sticky Search Bar --- */}
          <View className="border-b border-gray-50 px-5 py-4">
            <View className="h-11 flex-row items-center rounded-full border border-gray-200 bg-[#F8FAFC] px-4">
              <TextInput
                className="h-full flex-1 px-2 text-right font-cairo-semibold text-[#111111]"
                placeholder="ابحث عن..."
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
              />
              <Feather name="search" size={18} color="#94A3B8" />
            </View>
          </View>

          {/* --- 3. Scrollable List --- */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
                className="flex-row items-center justify-between border-b border-gray-50 py-4"
              >
                <Feather name="chevron-left" size={18} color="#94A3B8" />
                <Text className="font-cairo-semibold text-[15px] text-[#111111]">
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center pt-10">
                <Text className="font-cairo-medium text-[#94A3B8]">
                  لا توجد نتائج مطابقة لبحثك
                </Text>
              </View>
            }
          />
        </View>
      </BottomSheetModal>
    );
  },
);

SelectionDrawer.displayName = 'SelectionDrawer';

export default SelectionDrawer;

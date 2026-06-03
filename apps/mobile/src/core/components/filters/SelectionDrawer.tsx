import { Feather } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

const SelectionDrawer = forwardRef<any, SelectionDrawerProps>(
  ({ title, data, onSelect }, ref) => {
    // --- State ---
    const [visible, setVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    // --- Ref Expose ---
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
      },
      dismiss: () => {
        setVisible(false);
        setSearchText('');
        Keyboard.dismiss();
      },
    }));

    const handleClose = () => {
      setVisible(false);
      setSearchText('');
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
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="h-[85%] w-full rounded-t-[24px] bg-white">
                {/* --- 1. Header --- */}
                <View className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-4 pt-4">
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
                <View className="border-b border-gray-55 px-5 py-4">
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

SelectionDrawer.displayName = 'SelectionDrawer';

export default SelectionDrawer;

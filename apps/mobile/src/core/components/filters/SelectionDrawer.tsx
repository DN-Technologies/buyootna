import { Feather } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  Text,
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
                <View className="flex-row items-center justify-between px-5 pb-4 pt-4">
                  <TouchableOpacity onPress={handleClose} className="-ml-2 p-2">
                    <Feather name="chevron-right" size={24} color="#111111" />
                  </TouchableOpacity>
                  <Text className="font-cairo text-lg leading-[24px] text-[#111111]">
                    {title}
                  </Text>
                  {/* Centering placeholder */}
                  <View className="w-8" />
                </View>

                {/* --- 3. Scrollable List --- */}
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 50,
                  }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item)}
                      className="flex-row items-center justify-between border-b border-gray-50 py-3"
                    >
                      <Text className="font-cairo text-[14px] leading-[22px] text-[#111111]">
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

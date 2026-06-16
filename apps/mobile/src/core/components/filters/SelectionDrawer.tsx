import { Feather } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  ScrollView,
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
  multiSelect?: boolean;
  // If multiSelect is true:
  selectedItems?: SelectionItem[];
  onSelectMultiple?: (items: SelectionItem[]) => void;
  // If multiSelect is false or omitted:
  selectedItem?: SelectionItem | null;
  onSelect?: (item: SelectionItem) => void;
}

const SelectionDrawer = forwardRef<any, SelectionDrawerProps>(
  (
    {
      title,
      data,
      multiSelect = false,
      selectedItems = [],
      onSelectMultiple,
      selectedItem = null,
      onSelect,
    },
    ref,
  ) => {
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

    const handleToggle = (item: SelectionItem) => {
      if (!onSelectMultiple) return;

      let newSelected: SelectionItem[];
      if (item.id === 'all') {
        // If "All" is tapped:
        // Toggle "All". If already selected, clear it. Otherwise, select ONLY "All".
        const exists = selectedItems.some((i) => i.id === 'all');
        newSelected = exists ? [] : [item];
      } else {
        // If a normal item is tapped:
        // Remove "All" if it was selected.
        const withoutAll = selectedItems.filter((i) => i.id !== 'all');
        const exists = withoutAll.some((i) => i.id === item.id);
        if (exists) {
          newSelected = withoutAll.filter((i) => i.id !== item.id);
        } else {
          newSelected = [...withoutAll, item];
        }
      }
      onSelectMultiple(newSelected);
    };

    const handleRowPress = (item: SelectionItem) => {
      if (multiSelect) {
        handleToggle(item);
      } else {
        if (onSelect) {
          onSelect(item);
        }
        handleClose();
      }
    };

    // --- Search Filter Logic ---
    const filteredData = useMemo(() => {
      if (!searchText.trim()) return data;
      return data.filter((item) => item.label.includes(searchText));
    }, [searchText, data]);

    const renderCheckbox = (isSelected: boolean) => {
      if (isSelected) {
        return (
          <View className="h-5 w-5 items-center justify-center rounded-md bg-[#15304D]">
            <Feather name="check" size={12} color="white" />
          </View>
        );
      }
      return (
        <View className="h-5 w-5 rounded-md border border-gray-300 bg-white" />
      );
    };

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

                {/* --- 2. Selected Pills (Horizontal Scroll) --- */}
                {multiSelect && selectedItems.length > 0 && (
                  <View className="px-5 pb-4">
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                      className="flex-row"
                    >
                      {selectedItems.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.7}
                          onPress={() => handleToggle(item)}
                          className="flex-row items-center gap-1.5 rounded-full border border-[#15304D]/10 bg-[#15304D]/5 px-3.5 py-1.5"
                        >
                          <Text className="font-cairo text-xs leading-[18px] text-[#15304D]">
                            {item.label}
                          </Text>
                          <Feather name="x" size={14} color="#15304D" />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

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
                  renderItem={({ item }) => {
                    const isSelected = multiSelect
                      ? selectedItems.some((i) => i.id === item.id)
                      : selectedItem?.id === item.id;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRowPress(item)}
                        className={`mb-1 flex-row items-center justify-between rounded-lg px-3 py-3 ${
                          isSelected ? 'bg-[#15304D]/5' : 'bg-transparent'
                        }`}
                      >
                        {multiSelect ? (
                          <>
                            {renderCheckbox(isSelected)}
                            <Text
                              className={`mx-3 flex-1 font-cairo text-[14px] leading-[22px] ${
                                isSelected
                                  ? 'font-cairo-semibold text-[#15304D]'
                                  : 'text-[#111111]'
                              }`}
                              style={{
                                writingDirection: 'rtl',
                              }}
                            >
                              {item.label}
                            </Text>
                          </>
                        ) : (
                          <Text
                            className={`flex-1 font-cairo text-[14px] leading-[22px] ${
                              isSelected
                                ? 'font-cairo-semibold text-[#15304D]'
                                : 'text-[#111111]'
                            }`}
                            style={{
                              writingDirection: 'rtl',
                            }}
                          >
                            {item.label}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
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

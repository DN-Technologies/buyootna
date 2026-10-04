import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import FieldLabel from '@/features/company/components/invoice/FieldLabel';

interface ServiceTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelect: (label: string) => void;
}

// A combo field: type to filter, or pick from the dropdown. The chevron
// sits on the visual left, matching the RTL field layout.
export default function ServiceTypeField({
  value,
  onChange,
  options,
  isOpen,
  onToggleOpen,
  onSelect,
}: ServiceTypeFieldProps) {
  return (
    <View className="gap-1.5">
      <FieldLabel text="نوع الخدمة" />
      <View>
        <View
          className={`h-[46px] w-full flex-row items-center rounded-md border border-[#ECECEC] bg-white px-3 ${
            isOpen ? 'border-b-0 rounded-b-none' : ''
          }`}
        >
          <TextInput
            value={value}
            onChangeText={onChange}
            onFocus={onToggleOpen}
            placeholder="اختر أو اكتب نوع الخدمة التي تريد اضافتها"
            placeholderTextColor="#979797"
            className="h-full flex-1 text-right font-cairo text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          />
          <TouchableOpacity
            onPress={onToggleOpen}
            className="ml-2 h-6 w-6 items-center justify-center"
          >
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#111111"
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown options panel */}
        {isOpen && (
          <View
            className="max-h-[355px] overflow-hidden rounded-b-md rounded-t-none border border-[#ECECEC] bg-white p-3"
            style={{
              shadowColor: '#939393',
              shadowOpacity: 0.2,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              {options.map((option) => {
                const isSelected = option.label === value;
                return (
                  <TouchableOpacity
                    key={option.id}
                    activeOpacity={0.7}
                    onPress={() => onSelect(option.label)}
                    className="h-9 w-full flex-row items-center px-2"
                  >
                    <Text
                      className="flex-1 font-cairo-medium text-[13px] text-[#111111]"
                      style={{ writingDirection: 'rtl' }}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkbox" size={16} color="#15304D" />
                    )}
                  </TouchableOpacity>
                );
              })}
              {options.length === 0 && (
                <Text
                  className="py-2 text-right font-cairo text-[13px] text-[#979797]"
                  style={{ writingDirection: 'rtl' }}
                >
                  لا توجد نتائج مطابقة
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

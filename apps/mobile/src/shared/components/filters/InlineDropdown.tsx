import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export interface DropdownOption {
  id: string;
  label: string;
}

export interface InlineDropdownProps {
  title: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function InlineDropdown({
  title,
  placeholder,
  options,
  value,
  onChange,
}: InlineDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.id === value)?.label;

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <View className="mb-6 w-full">
      {/* Title */}
      <Text
        className="mb-1 font-cairo text-[14px] leading-[22px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>

      {/* Dropdown Header/Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
        className={`h-[46px] flex-row items-center justify-between rounded-md border bg-white px-4 ${
          isOpen ? 'border-[#15304D]' : 'border-gray-200'
        }`}
      >
        <Text
          className={`font-cairo text-[13px] leading-[22px] ${
            selectedLabel ? 'text-[#111111]' : 'text-[#979797]'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          {selectedLabel || placeholder}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B6A6A"
        />
      </TouchableOpacity>

      {/* Expanded Options List */}
      {isOpen && (
        // The shadow sits on an outer view: overflow-hidden (needed for the
        // rounded corners) would clip it on iOS
        <View
          className="mt-1 rounded-md bg-white"
          style={{
            shadowColor: '#0F172A',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <View className="max-h-64 overflow-hidden rounded-md border border-gray-200 bg-white">
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => handleSelect(option.id)}
                className={`items-start px-4 py-3 ${
                  index !== options.length - 1 ? 'border-b border-gray-100' : ''
                } ${value === option.id ? 'bg-gray-50' : ''}`}
              >
                <Text
                  className={`font-cairo-medium text-[14px] ${
                    value === option.id ? 'text-[#15304D]' : 'text-[#111111]'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

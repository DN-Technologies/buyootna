import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

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
  // Shown after the title: a red * / "(اختياري)"
  required?: boolean;
  optional?: boolean;
  // Greyed and closed (e.g. نوع الطلب until a specialty is chosen)
  disabled?: boolean;
  testID?: string;
}

export default function InlineDropdown({
  title,
  placeholder,
  options,
  value,
  onChange,
  required,
  optional,
  disabled = false,
  testID,
}: InlineDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.id === value)?.label;

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const open = isOpen && !disabled;

  return (
    // Open, it's raised above the fields after it (zIndex; elevation sets the
    // drawing order on Android) so its list covers them instead of pushing
    // them down
    <View
      className="mb-6 w-full"
      style={{ zIndex: open ? 20 : 0, elevation: open ? 20 : 0 }}
    >
      {/* Title */}
      <Text
        className="mb-1 font-cairo text-[14px] leading-[22px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
        <RequirementMark required={required} optional={optional} />
      </Text>

      <View>
      {/* Dropdown Header/Trigger */}
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.7}
        disabled={disabled}
        accessibilityState={{ disabled }}
        onPress={() => setIsOpen(!isOpen)}
        className={`h-[46px] flex-row items-center justify-between rounded-md border px-4 ${
          isOpen ? 'border-[#15304D]' : 'border-gray-200'
        } ${disabled ? 'bg-gray-50' : 'bg-white'}`}
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

      {/* Expanded Options List: over the next fields, just under the trigger */}
      {open && (
        // The shadow sits on an outer view: overflow-hidden (needed for the
        // rounded corners) would clip it on iOS
        <View
          className="rounded-md bg-white"
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            shadowColor: '#0F172A',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          {/* Taller list (QA): more of a long list shows before it scrolls */}
          <View className="max-h-80 overflow-hidden rounded-md border border-gray-200 bg-white">
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                testID={testID ? `${testID}-${option.id}` : undefined}
                activeOpacity={0.7}
                onPress={() => handleSelect(option.id)}
                className={`min-h-[52px] items-start justify-center px-4 py-3.5 ${
                  index !== options.length - 1 ? 'border-b border-gray-100' : ''
                } ${value === option.id ? 'bg-gray-50' : ''}`}
              >
                <Text
                    className={`font-cairo-medium text-[14px] leading-[22px] ${
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
    </View>
  );
}

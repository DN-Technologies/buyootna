import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ChevronDownIcon } from '@/assets/icons/company-add';

interface DropdownFieldProps {
  testID: string;
  label: string;
  placeholder: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  // A locked field shows its value greyed, with a padlock (Figma 8461:26357)
  locked?: boolean;
  children: ReactNode;
}

/**
 * A labelled field that opens an inline options panel under it (Figma
 * 4410:167341 closed, 4410:167821 / 8455:24388 open): the value on the
 * right, the chevron on the left.
 */
export default function DropdownField({
  testID,
  label,
  placeholder,
  value,
  isOpen,
  onToggle,
  locked = false,
  children,
}: DropdownFieldProps) {
  return (
    <View className="gap-1.5">
      <Text
        className={`font-cairo-medium text-[14px] ${locked ? 'text-[#A0A0A0]' : 'text-[#111111]'}`}
        style={{ writingDirection: 'rtl' }}
      >
        {label}
        <Text className="text-[#D12121]"> *</Text>
      </Text>

      <TouchableOpacity
        testID={testID}
        activeOpacity={locked ? 1 : 0.7}
        disabled={locked}
        onPress={onToggle}
        className="h-[46px] w-full flex-row items-center justify-between gap-2 rounded-[6px] border border-[#ECECEC] bg-white px-3"
      >
        <Text
          testID={`${testID}-value`}
          numberOfLines={1}
          className={`flex-1 font-cairo text-[14px] ${
            value && !locked ? 'text-[#111111]' : 'text-[#979797]'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          {value || placeholder}
        </Text>
        {locked ? (
          // Figma 8461:26357: a padlock where the chevron was
          <Image
            testID={`${testID}-locked`}
            source={require('@/assets/icons/services/lock.svg')}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
          />
        ) : (
          <View style={isOpen ? { transform: [{ rotate: '180deg' }] } : null}>
            <ChevronDownIcon />
          </View>
        )}
      </TouchableOpacity>

      {isOpen && (
        <View
          testID={`${testID}-options`}
          className="max-h-[320px] rounded-[6px] border border-[#ECECEC] bg-white px-[14px] py-3"
        >
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

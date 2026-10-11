import { Feather } from '@expo/vector-icons';
import { Keyboard, Platform, Text, TextInput, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

import { PLACEHOLDER_COLOR,requestQuoteInputStyle } from './styles';

export interface RequestQuotePriceRangeProps {
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (val: string) => void;
  onPriceToChange: (val: string) => void;
  keyboardAccessoryId?: string;
}

export default function RequestQuotePriceRange({
  priceFrom,
  priceTo,
  onPriceFromChange,
  onPriceToChange,
  keyboardAccessoryId,
}: RequestQuotePriceRangeProps) {
  return (
    <View className="mb-6 w-full">
      <View className="mb-2 flex-row items-center gap-1">
        <Text
          className="font-cairo-medium text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          نطاق السعر
          <RequirementMark optional />
        </Text>
        <Feather name="info" size={13} color="#94A3B8" />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextInput
            value={priceTo}
            onChangeText={onPriceToChange}
            placeholder="الى"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            inputAccessoryViewID={
              Platform.OS === 'ios' ? keyboardAccessoryId : undefined
            }
            style={requestQuoteInputStyle}
          />
        </View>
        <View className="flex-1">
          <TextInput
            value={priceFrom}
            onChangeText={onPriceFromChange}
            placeholder="من"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            inputAccessoryViewID={
              Platform.OS === 'ios' ? keyboardAccessoryId : undefined
            }
            style={requestQuoteInputStyle}
          />
        </View>
      </View>
    </View>
  );
}

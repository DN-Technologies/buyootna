import { Feather } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Keyboard, Platform, Text, View } from 'react-native';

import {
  PLACEHOLDER_COLOR,
  requestQuoteInputStyle,
} from '@/features/individual/components/request-quote/styles';

// The popup's text fields use BottomSheetTextInput, so the sheet moves
// with the keyboard; they share the quote screen's input style

interface PriceRangeProps {
  priceFrom: string;
  priceTo: string;
  onPriceFromChange: (val: string) => void;
  onPriceToChange: (val: string) => void;
  keyboardAccessoryId: string;
}

export function QuotePriceRangeFields({
  priceFrom,
  priceTo,
  onPriceFromChange,
  onPriceToChange,
  keyboardAccessoryId,
}: PriceRangeProps) {
  const accessory = Platform.OS === 'ios' ? keyboardAccessoryId : undefined;
  return (
    <View className="mb-6 w-full">
      <View className="mb-2 flex-row items-center gap-1">
        <Text
          className="font-cairo-medium text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          نطاق السعر
        </Text>
        <Feather name="info" size={13} color="#94A3B8" />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <BottomSheetTextInput
            value={priceTo}
            onChangeText={onPriceToChange}
            placeholder="الى"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            inputAccessoryViewID={accessory}
            style={requestQuoteInputStyle}
          />
        </View>
        <View className="flex-1">
          <BottomSheetTextInput
            value={priceFrom}
            onChangeText={onPriceFromChange}
            placeholder="من"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            inputAccessoryViewID={accessory}
            style={requestQuoteInputStyle}
          />
        </View>
      </View>
    </View>
  );
}

interface DescriptionProps {
  value: string;
  onChange: (text: string) => void;
  keyboardAccessoryId: string;
}

export function QuoteDescriptionField({
  value,
  onChange,
  keyboardAccessoryId,
}: DescriptionProps) {
  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-2 font-cairo-medium text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        وصف
      </Text>
      <BottomSheetTextInput
        value={value}
        onChangeText={onChange}
        placeholder="اشرح تفاصيل الخدمة المطلوبة..."
        placeholderTextColor={PLACEHOLDER_COLOR}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        inputAccessoryViewID={
          Platform.OS === 'ios' ? keyboardAccessoryId : undefined
        }
        style={[requestQuoteInputStyle, { height: 100, paddingTop: 12 }]}
      />
    </View>
  );
}

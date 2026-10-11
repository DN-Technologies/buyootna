import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

export interface DatePickerGroupProps {
  startDate: string;
  endDate: string;
  onStartPress: () => void;
  onEndPress: () => void;
  // Both dates are optional in the alert form: shows "(اختياري)" on each
  optional?: boolean;
}

export default function DatePickerGroup({
  startDate,
  endDate,
  onStartPress,
  onEndPress,
  optional,
}: DatePickerGroupProps) {
  return (
    <View className="mb-6 w-full flex-row gap-3">
      {/* Date To (التاريخ الى) */}
      <View className="flex-1">
        <Text
          className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          التاريخ الى
          <RequirementMark optional={optional} />
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEndPress}
          className="h-[40px] flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4"
        >
          <Feather name="calendar" size={16} color="#979797" />
          <Text
            className={`font-cairo text-[13px] leading-[22px] ${endDate ? 'text-[#111111]' : 'text-[#979797]'}`}
            style={{ writingDirection: 'rtl' }}
          >
            {endDate || '12/6'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date From (التاريخ من) */}
      <View className="flex-1">
        <Text
          className="mb-1 font-cairo text-sm leading-[22px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          التاريخ من
          <RequirementMark optional={optional} />
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onStartPress}
          className="h-[40px] flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4"
        >
          <Feather name="calendar" size={16} color="#979797" />
          <Text
            className={`font-cairo text-[13px] leading-[22px] ${startDate ? 'text-[#111111]' : 'text-[#979797]'}`}
            style={{ writingDirection: 'rtl' }}
          >
            {startDate || '12/6'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

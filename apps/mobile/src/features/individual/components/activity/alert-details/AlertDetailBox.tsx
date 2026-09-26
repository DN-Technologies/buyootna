import { Text, View } from 'react-native';

export interface AlertDetailBoxProps {
  title: string;
  value: string;
  className?: string;
  testID?: string;
}

export default function AlertDetailBox({
  title,
  value,
  className = '',
  testID,
}: AlertDetailBoxProps) {
  return (
    <View
      testID={testID}
      className={`rounded-[6px] border border-[#D7D7D7] bg-white p-2.5 justify-center ${className}`}
    >
      <Text
        className="font-cairo-medium text-[12px] leading-[16px] text-[#A0A0A0]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <Text
        className="mt-1 font-cairo-bold text-[13px] leading-[18px] text-[#15304D]"
        style={{ writingDirection: 'rtl' }}
      >
        {value}
      </Text>
    </View>
  );
}

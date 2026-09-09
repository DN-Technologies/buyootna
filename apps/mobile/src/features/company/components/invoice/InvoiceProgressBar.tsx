import { Text, View } from 'react-native';

interface InvoiceProgressBarProps {
  /** Current wizard step (1-based). */
  step: number;
  totalSteps?: number;
}

export default function InvoiceProgressBar({
  step,
  totalSteps = 2,
}: InvoiceProgressBarProps) {
  return (
    <View className="gap-1">
      <Text
        className="text-right font-cairo-semibold text-[12px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        خطوة {step}/{totalSteps}
      </Text>
      <View className="h-1 w-full overflow-hidden rounded-full bg-[#D7D7D7]">
        <View
          className="h-full rounded-full bg-[#00A447]"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </View>
    </View>
  );
}

import { Text, View } from 'react-native';

interface InvoiceProgressBarProps {
  /** Current wizard step (1-based). */
  step: number;
  totalSteps?: number;
}

// Figma "progress": the green part is 229 of the 343px track on step 1
const STEP_ONE_FILL = 229 / 343;

export default function InvoiceProgressBar({
  step,
  totalSteps = 2,
}: InvoiceProgressBarProps) {
  const fill = step >= totalSteps ? 1 : STEP_ONE_FILL;

  return (
    <View className="gap-[5px]">
      <Text
        className="font-cairo-semibold text-[12px] leading-[14px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        خطوة {totalSteps}/{step}
      </Text>
      <View className="h-1 w-full overflow-hidden rounded-[4px] bg-[#D7D7D7]">
        <View
          testID="invoice-progress-fill"
          className="h-full rounded-[4px] bg-[#00A447]"
          style={{ width: `${fill * 100}%` }}
        />
      </View>
    </View>
  );
}

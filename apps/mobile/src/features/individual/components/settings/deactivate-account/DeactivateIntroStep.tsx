import { Text, View } from 'react-native';

import DeactivateSheetActions from './DeactivateSheetActions';
import SuspendIcon from './SuspendIcon';

interface DeactivateIntroStepProps {
  onContinue: () => void;
  onCancel: () => void;
}

// Step 1: warning (Figma 1684:60307)
export default function DeactivateIntroStep({
  onContinue,
  onCancel,
}: DeactivateIntroStepProps) {
  return (
    <View
      testID="deactivate-step-intro"
      className="flex-1 items-center justify-between"
    >
      <View className="items-center pt-2">
        <View className="mb-4 h-[75px] w-[75px] items-center justify-center rounded-full bg-[#FFFEFA] border border-[#FFF8E7]">
          <SuspendIcon size={34} color="#B97500" />
        </View>

        <Text className="mb-2 text-center font-cairo-semibold text-[18px] text-[#111111]">
          تعطيل الحساب مؤقتًا؟
        </Text>

        <Text
          className="px-4 text-center font-cairo-medium text-[14px] leading-[22px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          سيتم إخفاء إعلاناتك وخدماتك مؤقتًا ولن يتمكن الآخرون من التواصل معك
          حتى إعادة تفعيل الحساب.
        </Text>
      </View>

      <DeactivateSheetActions
        primaryLabel="متابعة التعطيل"
        primaryTestID="deactivate-intro-continue"
        onPrimary={onContinue}
        cancelTestID="deactivate-intro-cancel"
        onCancel={onCancel}
      />
    </View>
  );
}

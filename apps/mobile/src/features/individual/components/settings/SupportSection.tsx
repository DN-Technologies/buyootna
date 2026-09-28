import { Text, View } from 'react-native';

import { PrivacyIcon, TermsIcon } from '@/assets/icons/settings';
import MenuItem from '@/shared/components/ui/MenuItem';

interface SupportSectionProps {
  onPrivacy: () => void;
  onTerms: () => void;
}

export default function SupportSection({
  onPrivacy,
  onTerms,
}: SupportSectionProps) {
  return (
    <View>
      <Text
        className="mb-2 font-cairo-semibold text-[14px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        الدعم والمساعدة
      </Text>
      <View className="rounded-xl bg-[#F9FAFE] px-4">
        <MenuItem icon={PrivacyIcon} title="سياسة الخصوصية" onPress={onPrivacy} />
        <MenuItem icon={TermsIcon} title="الشروط والأحكام" onPress={onTerms} />
      </View>
    </View>
  );
}

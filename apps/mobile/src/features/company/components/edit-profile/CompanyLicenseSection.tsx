import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface CompanyLicenseSectionProps {
  specialty: string;
  onOpenActivityModal: () => void;
}

/**
 * «التخصص» on company edit profile. The licence (number, expiry, image)
 * isn't edited here any more: it's sent with «طلب التوثيق» from المزيد and
 * reviewed before the «موثق» badge.
 */
export default function CompanyLicenseSection({
  specialty,
  onOpenActivityModal,
}: CompanyLicenseSectionProps) {
  return (
    <View className="mt-7">
      {/* Field: التخصص (it can't change while services from it exist) */}
      <Text
        className="mb-1.5 font-cairo-medium text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        التخصص
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenActivityModal}
        className="h-[46px] flex-row items-center justify-between rounded-[8px] border border-[#ECECEC] bg-white px-3"
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-cairo-regular text-[14px] ${specialty ? 'text-[#111111]' : 'text-[#979797]'}`}
          style={{ writingDirection: 'rtl' }}
        >
          {specialty || 'اختر التخصص'}
        </Text>
        <Feather name="chevron-down" size={16} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}

import { Text, TouchableOpacity, View } from 'react-native';

export interface CompanyServiceItemData {
  id: string;
  title: string;
  description: string;
}

interface CompanyServicesTabProps {
  services?: CompanyServiceItemData[];
  onRequestQuote: () => void;
}

const DEFAULT_SERVICES: CompanyServiceItemData[] = [
  {
    id: '1',
    title: 'الأثاث',
    description: 'أثاث منزلي ومكتبي بجودة عالية.',
  },
  {
    id: '2',
    title: 'شبكات نت',
    description: 'تركيب وصيانة شبكات الإنترنت والاتصالات.',
  },
];

export default function CompanyServicesTab({
  services = DEFAULT_SERVICES,
  onRequestQuote,
}: CompanyServicesTabProps) {
  return (
    <View className="flex-1 pb-24">
      <View className="gap-3 mb-6">
        {services.map((svc) => (
          <View
            key={svc.id}
            className="rounded-md border border-[#ECECEC] bg-white py-4 px-2"
          >
            <Text className="mb-1 font-cairo-bold text-[14px] leading-[22px] text-[#111111]"
              style={{writingDirection: "rtl"}}
            >
              {svc.title}
            </Text>
            <Text className="font-cairo text-[12px] leading-[20px] text-[#6B6A6A]"
              style={{writingDirection: "rtl"}}
            >
              {svc.description}
            </Text>
          </View>
        ))}
      </View>

      {/* Quote Request Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRequestQuote}
        className="w-full items-center justify-center rounded-full bg-[#15304D] py-3.5 shadow-md"
      >
        <Text className="font-cairo-bold text-base leading-[24px] text-white">
          طلب عرض سعر
        </Text>
      </TouchableOpacity>
    </View>
  );
}

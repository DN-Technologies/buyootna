import { Text, View } from 'react-native';

export interface CompanyServiceItemData {
  id: string;
  title: string;
  description: string;
}

interface CompanyServicesTabProps {
  services?: CompanyServiceItemData[];
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
    </View>
  );
}

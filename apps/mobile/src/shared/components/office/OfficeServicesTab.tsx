import { Text, View } from 'react-native';

export interface OfficeServiceItemData {
  id: string;
  title: string;
  description: string;
}

interface OfficeServicesTabProps {
  services?: OfficeServiceItemData[];
}

const DEFAULT_SERVICES: OfficeServiceItemData[] = [
  {
    id: '1',
    title: 'بيع وتأجير العقارات',
    description: 'تسويق وإدارة العقارات السكنية والتجارية في جميع مناطق الكويت.',
  },
  {
    id: '2',
    title: 'استشارات عقارية',
    description: 'تقديم دراسات واستشارات متخصصة للسوق العقاري.',
  },
];

export default function OfficeServicesTab({
  services = DEFAULT_SERVICES,
}: OfficeServicesTabProps) {
  return (
    <View className="flex-1 pb-24">
      <View className="mb-6 gap-3">
        {services.map((svc) => (
          <View
            key={svc.id}
            className="rounded-xl border border-[#ECECEC] bg-white p-4 shadow-sm"
          >
            <Text
              className="mb-1 font-cairo-bold text-[14px] leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {svc.title}
            </Text>
            <Text
              className="font-cairo text-[12px] leading-[20px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {svc.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
